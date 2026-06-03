-- Deploy: schemas/myapp_auth_public/procedures/forgot_password/procedure
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_public/schema
-- requires: schemas/myapp_store_private/schema
-- requires: schemas/myapp_store_private/schema
-- requires: schemas/myapp_auth_private/tables/auth_rate_limits/table
-- requires: schemas/myapp_user_identifiers_public/tables/emails/table
-- requires: schemas/myapp_auth_private/tables/auth_ip_rate_limits/table
-- requires: schemas/myapp_auth_private/tables/app_settings_rate_limit/table


CREATE FUNCTION myapp_auth_public.forgot_password(
  IN email email
) RETURNS void AS $_PGFN_$
DECLARE
  v_email myapp_user_identifiers_public.emails;
  v_user_id uuid;
  v_token text;
  v_max_duration interval := '3 days'::interval;
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
    PERFORM pg_advisory_xact_lock(hashtext('ip_rate_limit_password_reset_request'), hashtext(v_ip_address::text));
    IF EXISTS (SELECT 1
    FROM myapp_auth_private.auth_ip_rate_limits
    WHERE
      ((ip_address = v_ip_address AND ua_hash = ANY( ARRAY[v_ua_hash, ''] )) AND action = 'password_reset_request') AND locked_until > now()
    LIMIT
    1) THEN
      RAISE EXCEPTION 'TOO_MANY_REQUESTS';
    END IF;
  END IF;
  SELECT *
  FROM myapp_user_identifiers_public.emails AS e
  WHERE
    e.email = forgot_password.email::email INTO v_email;
  IF NOT (FOUND) THEN
    RETURN;
  END IF;
  SELECT
    membership_status.is_verified,
    membership_status.is_disabled,
    membership_status.is_banned
  FROM myapp_memberships_public.app_memberships AS membership_status
  WHERE
    membership_status.actor_id = v_email.owner_id INTO v_user_is_verified, v_user_is_disabled, v_user_is_banned;
  IF v_user_is_banned IS TRUE OR v_user_is_disabled IS TRUE THEN
    RETURN;
  END IF;
  v_user_id := v_email.owner_id;
  SELECT *
  FROM myapp_auth_private.auth_rate_limits
  WHERE
    subject_id = v_user_id AND action = 'password_reset_request' INTO v_user_rate_limit;
  IF v_user_rate_limit.last_attempt_at IS NOT NULL AND now() < (v_user_rate_limit.last_attempt_at + v_rate_settings.email_cooldown_period) THEN
    RETURN;
  END IF;
  INSERT INTO myapp_logging_public.audit_log_auth (
    actor_id,
    event,
    success
  )
  VALUES
    (v_email.owner_id, 'forgot_password', true);
  v_token := encode(gen_random_bytes(7), 'hex');
  PERFORM myapp_store_private.user_secrets_set(v_user_id, 'reset_password_token', v_token, 'crypt');
  INSERT INTO myapp_auth_private.auth_rate_limits (
    subject_id,
    action,
    attempts,
    first_attempt_at,
    last_attempt_at
  )
  VALUES
    (v_user_id, 'password_reset_request', 0, now(), now())
  ON CONFLICT (subject_id, action) DO UPDATE SET
  last_attempt_at = now();
  PERFORM app_jobs.add_job('email:send_verification_link', json_build_object('email_type', 'forgot_password', 'user_id', v_user_id, 'email', v_email.email::text, 'reset_token', v_token));
  RETURN;
END;
$_PGFN_$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;

