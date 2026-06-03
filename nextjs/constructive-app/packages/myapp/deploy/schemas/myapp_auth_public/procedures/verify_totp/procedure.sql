-- Deploy: schemas/myapp_auth_public/procedures/verify_totp/procedure
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_public/schema
-- requires: schemas/myapp_store_private/schema
-- requires: schemas/myapp_auth_private/tables/auth_rate_limits/table


CREATE FUNCTION myapp_auth_public.verify_totp(
  IN totp_value text
) RETURNS boolean AS $_PGFN_$
DECLARE
  v_session myapp_auth_private.sessions;
  totp_secret text;
  v_user_id uuid;
  v_session_id uuid;
  v_user_rate_limit myapp_auth_private.auth_rate_limits;
BEGIN
  v_user_id := jwt_public.current_user_id();
  v_session_id := jwt_private.current_session_id();
  PERFORM pg_advisory_xact_lock(hashtext('verify_totp'), hashtext(v_user_id::text));
  totp_secret := myapp_store_private.user_state_get(v_user_id, 'totp_secret');
  IF totp_secret IS NULL THEN
    RAISE EXCEPTION 'TOTP_NOT_ENABLED';
  END IF;
  SELECT *
  FROM myapp_auth_private.auth_rate_limits
  WHERE
    subject_id = v_user_id AND action = 'verify_totp' INTO v_user_rate_limit;
  IF v_user_rate_limit.locked_until IS NOT NULL AND v_user_rate_limit.locked_until > now() THEN
    RAISE EXCEPTION 'ACCOUNT_LOCKED_EXCEED_ATTEMPTS';
  END IF;
  IF totp.verify(totp_secret, verify_totp.totp_value, 30, 6) IS TRUE THEN
    DELETE FROM myapp_auth_private.auth_rate_limits
    WHERE
      subject_id = v_user_id AND action = 'verify_totp';
    INSERT INTO myapp_logging_public.audit_log_auth (
      actor_id,
      event,
      success
    )
    VALUES
      (v_user_id, 'verify_totp', true);
    UPDATE myapp_auth_private.sessions AS sess SET
    last_mfa_verified = CURRENT_TIMESTAMP, expires_at = expires_at + '30 minutes'::interval
    WHERE
      (sess.id = v_session_id AND CASE sess.uagent IS NULL 
          WHEN true THEN jwt_public.current_user_agent() IS NULL 
          ELSE sess.uagent = jwt_public.current_user_agent() 
        END) AND CASE sess.origin IS NULL 
          WHEN true THEN jwt_public.current_origin() IS NULL 
          ELSE sess.origin = jwt_public.current_origin() 
        END
    RETURNING * INTO v_session;
    RETURN true;
  ELSE
    INSERT INTO myapp_logging_public.audit_log_auth (
      actor_id,
      event,
      success
    )
    VALUES
      (v_user_id, 'verify_totp', false);
    INSERT INTO myapp_auth_private.auth_rate_limits (
      subject_id,
      action,
      attempts,
      first_attempt_at,
      last_attempt_at,
      locked_until
    )
    VALUES
      (v_user_id, 'verify_totp', 1, now(), now(), NULL)
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
    RETURN NULL;
  END IF;
END;
$_PGFN_$ LANGUAGE plpgsql VOLATILE STRICT SECURITY DEFINER;

