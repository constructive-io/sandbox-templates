-- Deploy: schemas/myapp_auth_public/procedures/confirm_delete_account/procedure
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_public/schema
-- requires: schemas/myapp_users_public/tables/users/table
-- requires: schemas/myapp_auth_private/tables/auth_rate_limits/table
-- requires: schemas/myapp_auth_private/tables/auth_ip_rate_limits/table
-- requires: schemas/myapp_auth_private/tables/app_settings_rate_limit/table


CREATE FUNCTION myapp_auth_public.confirm_delete_account(
  IN user_id uuid,
  IN token text
) RETURNS boolean AS $_PGFN_$
DECLARE
  v_expires_interval interval := '3 days'::interval;
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
    PERFORM pg_advisory_xact_lock(hashtext('ip_rate_limit_account_deletion'), hashtext(v_ip_address::text));
    IF EXISTS (SELECT 1
    FROM myapp_auth_private.auth_ip_rate_limits
    WHERE
      ((ip_address = v_ip_address AND ua_hash = ANY( ARRAY[v_ua_hash, ''] )) AND action = 'account_deletion') AND locked_until > now()
    LIMIT
    1) THEN
      RAISE EXCEPTION 'TOO_MANY_REQUESTS';
    END IF;
  END IF;
  PERFORM pg_advisory_xact_lock(hashtext('account_deletion'), hashtext(confirm_delete_account.user_id::text));
  SELECT *
  FROM myapp_auth_private.auth_rate_limits
  WHERE
    subject_id = confirm_delete_account.user_id AND action = 'account_deletion' INTO v_user_rate_limit;
  IF v_user_rate_limit.locked_until IS NOT NULL AND v_user_rate_limit.locked_until > now() THEN
    RAISE EXCEPTION 'ACCOUNT_LOCKED_EXCEED_ATTEMPTS';
  END IF;
  IF v_user_rate_limit.last_attempt_at IS NOT NULL AND (v_user_rate_limit.last_attempt_at + v_expires_interval) < now() THEN
    DELETE FROM myapp_auth_private.auth_rate_limits
    WHERE
      subject_id = confirm_delete_account.user_id AND action = 'account_deletion';
    PERFORM myapp_store_private.user_secrets_del(confirm_delete_account.user_id, 'account_deletion_token');
    RETURN false;
  END IF;
  IF myapp_store_private.user_secrets_verify(confirm_delete_account.user_id, 'account_deletion_token', confirm_delete_account.token) THEN
    DELETE FROM myapp_auth_private.auth_rate_limits
    WHERE
      subject_id = confirm_delete_account.user_id AND action = 'account_deletion';
    PERFORM myapp_store_private.user_secrets_del(confirm_delete_account.user_id, 'account_deletion_token');
    DELETE FROM myapp_users_public.users
    WHERE
      id = confirm_delete_account.user_id;
    IF v_ip_address IS NOT NULL THEN
      DELETE FROM myapp_auth_private.auth_ip_rate_limits
      WHERE
        (ip_address = v_ip_address AND ua_hash = v_ua_hash) AND action = 'account_deletion';
      DELETE FROM myapp_auth_private.auth_ip_rate_limits
      WHERE
        (ip_address = v_ip_address AND ua_hash = '') AND action = 'account_deletion';
    END IF;
    RETURN true;
  ELSE
    INSERT INTO myapp_auth_private.auth_rate_limits (
      subject_id,
      action,
      attempts,
      first_attempt_at,
      last_attempt_at,
      locked_until
    )
    VALUES
      (confirm_delete_account.user_id, 'account_deletion', 1, now(), now(), NULL)
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
        (v_ip_address, v_ua_hash, 'account_deletion', 1, now(), NULL)
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
        (v_ip_address, '', 'account_deletion', 1, now(), NULL)
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

