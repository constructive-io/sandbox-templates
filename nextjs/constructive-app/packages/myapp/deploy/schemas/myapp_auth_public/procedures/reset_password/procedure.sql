-- Deploy: schemas/myapp_auth_public/procedures/reset_password/procedure
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_public/schema
-- requires: schemas/myapp_store_private/schema
-- requires: schemas/myapp_store_private/schema
-- requires: schemas/myapp_auth_private/tables/auth_rate_limits/table
-- requires: schemas/myapp_user_identifiers_public/tables/emails/table
-- requires: schemas/myapp_auth_private/tables/auth_ip_rate_limits/table
-- requires: schemas/myapp_auth_private/tables/app_settings_rate_limit/table


CREATE FUNCTION myapp_auth_public.reset_password(
  IN role_id uuid,
  IN reset_token text,
  IN new_password text
) RETURNS boolean AS $_PGFN_$
DECLARE
  v_user myapp_users_public.users;
  v_user_is_verified boolean := false;
  v_user_is_disabled boolean := false;
  v_user_is_banned boolean := false;
  v_user_rate_limit myapp_auth_private.auth_rate_limits;
  v_rate_settings myapp_auth_private.app_settings_rate_limit;
  v_ip_rate_limit myapp_auth_private.auth_ip_rate_limits;
  v_ip_address inet;
  v_ua_hash text;
BEGIN
  SELECT *
  FROM myapp_auth_private.app_settings_rate_limit
  LIMIT
  1 INTO v_rate_settings;
  SELECT myapp_auth_public.current_ip_address() INTO v_ip_address;
  IF v_ip_address IS NOT NULL THEN
    IF family(v_ip_address) = 6 THEN
      SELECT set_masklen(v_ip_address, 64) INTO v_ip_address;
    END IF;
    SELECT
      COALESCE(md5(myapp_auth_public.current_user_agent()), '__no_ua__') INTO v_ua_hash;
    PERFORM pg_advisory_xact_lock(hashtext('ip_rate_limit_password_reset'), hashtext(v_ip_address::text));
    IF EXISTS (SELECT 1
    FROM myapp_auth_private.auth_ip_rate_limits
    WHERE
      ((ip_address = v_ip_address AND ua_hash = ANY( ARRAY[v_ua_hash, ''] )) AND action = 'password_reset') AND locked_until > now()
    LIMIT
    1) THEN
      RAISE EXCEPTION 'TOO_MANY_REQUESTS';
    END IF;
  END IF;
  IF (reset_password.role_id IS NULL OR reset_password.reset_token IS NULL) OR reset_password.new_password IS NULL THEN
    RAISE EXCEPTION 'NULL_VALUES_DISALLOWED';
  END IF;
  SELECT *
  FROM myapp_users_public.users AS u
  WHERE
    id = reset_password.role_id INTO v_user;
  IF NOT (FOUND) THEN
    RETURN NULL;
  END IF;
  SELECT
    membership_status.is_verified,
    membership_status.is_disabled,
    membership_status.is_banned
  FROM myapp_memberships_public.app_memberships AS membership_status
  WHERE
    membership_status.actor_id = reset_password.role_id INTO v_user_is_verified, v_user_is_disabled, v_user_is_banned;
  IF v_user_is_disabled IS TRUE OR v_user_is_banned IS TRUE THEN
    RAISE EXCEPTION 'ACCOUNT_DISABLED';
  END IF;
  PERFORM pg_advisory_xact_lock(hashtext('password_reset'), hashtext(v_user.id::text));
  SELECT *
  FROM myapp_auth_private.auth_rate_limits
  WHERE
    subject_id = v_user.id AND action = 'password_reset' INTO v_user_rate_limit;
  IF v_user_rate_limit.locked_until IS NOT NULL AND v_user_rate_limit.locked_until > now() THEN
    RAISE EXCEPTION 'PASSWORD_RESET_LOCKED_EXCEED_ATTEMPTS';
  END IF;
  IF myapp_store_private.user_secrets_verify(v_user.id, 'reset_password_token', reset_password.reset_token) THEN
    PERFORM myapp_store_private.user_secrets_set(v_user.id, 'password_hash', reset_password.new_password, 'crypt');
    DELETE FROM myapp_auth_private.auth_rate_limits
    WHERE
      subject_id = v_user.id AND action = 'sign_in';
    DELETE FROM myapp_auth_private.auth_rate_limits
    WHERE
      subject_id = v_user.id AND action = 'password_reset';
    PERFORM myapp_store_private.user_state_del(v_user.id, ARRAY['reset_password_token_generated']);
    PERFORM myapp_store_private.user_secrets_del(v_user.id, 'reset_password_token');
    INSERT INTO myapp_logging_public.audit_log_auth (
      actor_id,
      event,
      success
    )
    VALUES
      (v_user.id, 'reset_password', true);
    IF v_ip_address IS NOT NULL THEN
      DELETE FROM myapp_auth_private.auth_ip_rate_limits
      WHERE
        (ip_address = v_ip_address AND ua_hash = v_ua_hash) AND action = 'password_reset';
      DELETE FROM myapp_auth_private.auth_ip_rate_limits
      WHERE
        (ip_address = v_ip_address AND ua_hash = '') AND action = 'password_reset';
    END IF;
    RETURN true;
  ELSE
    INSERT INTO myapp_logging_public.audit_log_auth (
      actor_id,
      event,
      success
    )
    VALUES
      (v_user.id, 'reset_password', false);
    INSERT INTO myapp_auth_private.auth_rate_limits (
      subject_id,
      action,
      attempts,
      first_attempt_at,
      last_attempt_at,
      locked_until
    )
    VALUES
      (v_user.id, 'password_reset', 1, now(), now(), NULL)
    ON CONFLICT (subject_id, action) DO UPDATE SET
    attempts = CASE 
      WHEN auth_rate_limits.first_attempt_at < (now() - v_rate_settings.user_rate_limit_window) THEN 1 
      ELSE auth_rate_limits.attempts + 1 
    END, first_attempt_at = CASE 
      WHEN auth_rate_limits.first_attempt_at < (now() - v_rate_settings.user_rate_limit_window) THEN now() 
      ELSE auth_rate_limits.first_attempt_at 
    END, last_attempt_at = now(), locked_until = CASE 
      WHEN (auth_rate_limits.attempts + 1) >= v_rate_settings.user_max_attempts AND auth_rate_limits.first_attempt_at >= (now() - v_rate_settings.user_rate_limit_window) THEN now() + v_rate_settings.user_lockout_duration 
      ELSE NULL 
    END;
    IF v_ip_address IS NOT NULL THEN
      INSERT INTO myapp_auth_private.auth_ip_rate_limits (
        ip_address,
        ua_hash,
        action,
        attempts,
        first_attempt_at,
        locked_until
      )
      VALUES
        (v_ip_address, v_ua_hash, 'password_reset', 1, now(), NULL)
      ON CONFLICT (ip_address, ua_hash, action) DO UPDATE SET
      attempts = CASE 
        WHEN auth_ip_rate_limits.first_attempt_at < (now() - v_rate_settings.ip_rate_limit_window) THEN 1 
        ELSE auth_ip_rate_limits.attempts + 1 
      END, first_attempt_at = CASE 
        WHEN auth_ip_rate_limits.first_attempt_at < (now() - v_rate_settings.ip_rate_limit_window) THEN now() 
        ELSE auth_ip_rate_limits.first_attempt_at 
      END, locked_until = CASE 
        WHEN (auth_ip_rate_limits.attempts + 1) >= v_rate_settings.ip_ua_max_attempts AND auth_ip_rate_limits.first_attempt_at >= (now() - v_rate_settings.ip_rate_limit_window) THEN now() + v_rate_settings.ip_lockout_duration 
        ELSE NULL 
      END;
      INSERT INTO myapp_auth_private.auth_ip_rate_limits (
        ip_address,
        ua_hash,
        action,
        attempts,
        first_attempt_at,
        locked_until
      )
      VALUES
        (v_ip_address, '', 'password_reset', 1, now(), NULL)
      ON CONFLICT (ip_address, ua_hash, action) DO UPDATE SET
      attempts = CASE 
        WHEN auth_ip_rate_limits.first_attempt_at < (now() - v_rate_settings.ip_rate_limit_window) THEN 1 
        ELSE auth_ip_rate_limits.attempts + 1 
      END, first_attempt_at = CASE 
        WHEN auth_ip_rate_limits.first_attempt_at < (now() - v_rate_settings.ip_rate_limit_window) THEN now() 
        ELSE auth_ip_rate_limits.first_attempt_at 
      END, locked_until = CASE 
        WHEN (auth_ip_rate_limits.attempts + 1) >= v_rate_settings.ip_max_attempts AND auth_ip_rate_limits.first_attempt_at >= (now() - v_rate_settings.ip_rate_limit_window) THEN now() + v_rate_settings.ip_lockout_duration 
        ELSE NULL 
      END;
    END IF;
    RETURN false;
  END IF;
END;
$_PGFN_$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;

