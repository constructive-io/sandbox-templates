-- Deploy: schemas/myapp_auth_public/procedures/sign_in/procedure
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_public/schema
-- requires: schemas/myapp_auth_private/tables/sessions/table
-- requires: schemas/myapp_auth_private/tables/auth_rate_limits/table
-- requires: schemas/myapp_logging_public/tables/audit_log_auth/table
-- requires: schemas/myapp_auth_private/tables/app_settings_auth/table
-- requires: schemas/myapp_user_identifiers_public/tables/emails/table
-- requires: schemas/myapp_auth_private/tables/auth_ip_rate_limits/table
-- requires: schemas/myapp_auth_private/tables/session_credentials/table
-- requires: schemas/myapp_memberships_public/tables/app_memberships/table
-- requires: schemas/myapp_auth_private/tables/app_settings_rate_limit/table


CREATE FUNCTION myapp_auth_public.sign_in(
  IN email text,
  IN password text,
  IN remember_me boolean DEFAULT false,
  IN credential_kind text DEFAULT 'bearer',
  IN csrf_token text DEFAULT NULL,
  IN device_token text DEFAULT NULL,
  OUT id uuid,
  OUT user_id uuid,
  OUT access_token text,
  OUT access_token_expires_at timestamptz,
  OUT is_verified boolean,
  OUT totp_enabled boolean,
  OUT mfa_required boolean,
  OUT mfa_challenge_token text
) AS $_PGFN_$
DECLARE
  v_email myapp_user_identifiers_public.emails;
  v_settings myapp_auth_private.app_settings_auth;
  v_default_session_duration interval := '2 weeks'::interval;
  v_remember_me_duration interval := '30 days'::interval;
  v_require_csrf boolean := false;
  v_user_is_verified boolean := false;
  v_user_is_disabled boolean := false;
  v_user_is_banned boolean := false;
  v_user_rate_limit myapp_auth_private.auth_rate_limits;
  v_session_id uuid;
  v_credential_id uuid;
  v_plaintext_credential text;
  v_csrf_secret text;
  v_anon_session myapp_auth_private.sessions;
  v_session_expires_at timestamptz;
  v_mfa_enabled boolean := false;
  v_mfa_challenge_token text;
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
    PERFORM pg_advisory_xact_lock(hashtext('ip_rate_limit_sign_in'), hashtext(v_ip_address::text));
    IF EXISTS (SELECT 1
    FROM myapp_auth_private.auth_ip_rate_limits
    WHERE
      ((ip_address = v_ip_address AND ua_hash = ANY( ARRAY[v_ua_hash, ''] )) AND action = 'sign_in') AND locked_until > now()
    LIMIT
    1) THEN
      RAISE EXCEPTION 'TOO_MANY_REQUESTS';
    END IF;
  END IF;
  SELECT *
  FROM myapp_auth_private.app_settings_auth
  LIMIT
  1 INTO v_settings;
  IF NOT (COALESCE(v_settings.allow_password_sign_in, true)) THEN
    RAISE EXCEPTION 'PASSWORD_SIGN_IN_DISABLED';
  END IF;
  v_default_session_duration := COALESCE(v_settings.default_session_duration, '2 weeks'::interval);
  v_remember_me_duration := COALESCE(v_settings.remember_me_duration, '30 days'::interval);
  v_require_csrf := COALESCE(v_settings.require_csrf_for_auth, false);
  IF v_require_csrf AND sign_in.csrf_token IS NULL THEN
    RAISE EXCEPTION 'CSRF_TOKEN_REQUIRED';
  END IF;
  IF sign_in.csrf_token IS NOT NULL THEN
    SELECT s.*
    FROM myapp_auth_private.sessions AS s
    WHERE
      ((s.csrf_secret = sign_in.csrf_token AND s.is_anonymous = true) AND s.revoked_at IS NULL) AND s.expires_at > now() INTO v_anon_session;
    IF NOT (FOUND) THEN
      RAISE EXCEPTION 'INVALID_CSRF_TOKEN';
    END IF;
  END IF;
  SELECT *
  FROM myapp_user_identifiers_public.emails AS user_emails_alias
  WHERE
    user_emails_alias.email = sign_in.email::email INTO v_email;
  IF NOT (FOUND) THEN
    RETURN;
  END IF;
  PERFORM pg_advisory_xact_lock(hashtext('sign_in'), hashtext(v_email.owner_id::text));
  SELECT *
  FROM myapp_auth_private.auth_rate_limits
  WHERE
    subject_id = v_email.owner_id AND action = 'sign_in' INTO v_user_rate_limit;
  IF v_user_rate_limit.locked_until IS NOT NULL AND v_user_rate_limit.locked_until > now() THEN
    RAISE EXCEPTION 'ACCOUNT_LOCKED_EXCEED_ATTEMPTS';
  END IF;
  SELECT
    membership_status.is_verified,
    membership_status.is_disabled,
    membership_status.is_banned
  FROM myapp_memberships_public.app_memberships AS membership_status
  WHERE
    membership_status.actor_id = v_email.owner_id INTO v_user_is_verified, v_user_is_disabled, v_user_is_banned;
  IF v_user_is_disabled IS TRUE OR v_user_is_banned IS TRUE THEN
    RAISE EXCEPTION 'ACCOUNT_DISABLED';
  END IF;
  IF myapp_store_private.user_secrets_verify(v_email.owner_id, 'password_hash', sign_in.password) THEN
    DELETE FROM myapp_auth_private.auth_rate_limits
    WHERE
      subject_id = v_email.owner_id AND action = 'sign_in';
    INSERT INTO myapp_logging_public.audit_log_auth (
      actor_id,
      event,
      success
    )
    VALUES
      (v_email.owner_id, 'sign_in', true);
    IF v_anon_session.id IS NOT NULL THEN
      UPDATE myapp_auth_private.sessions SET
      revoked_at = now()
      WHERE
        id = v_anon_session.id;
    END IF;
    v_csrf_secret := encode(gen_random_bytes(32), 'hex');
    v_session_id := uuidv7();
    IF sign_in.remember_me IS TRUE THEN
      v_session_expires_at := now() + v_remember_me_duration;
    ELSE
      v_session_expires_at := now() + v_default_session_duration;
    END IF;
    INSERT INTO myapp_auth_private.sessions (
      id,
      user_id,
      is_anonymous,
      expires_at,
      last_password_verified,
      auth_method,
      csrf_secret,
      origin,
      uagent
    )
    VALUES
      (v_session_id, v_email.owner_id, false, v_session_expires_at, CURRENT_TIMESTAMP, 'password', v_csrf_secret, jwt_public.current_origin(), jwt_public.current_user_agent());
    v_plaintext_credential := (CASE 
      WHEN sign_in.credential_kind = 'api_key' THEN 'cnc_live_sk_' 
      WHEN sign_in.credential_kind = 'bearer' THEN 'cnc_live_bt_' 
      WHEN sign_in.credential_kind = 'access_token' THEN 'cnc_live_at_' 
      WHEN sign_in.credential_kind = 'mfa_challenge' THEN 'cnc_live_mfa_' 
      WHEN sign_in.credential_kind = 'one_time' THEN 'cnc_live_ot_' 
      WHEN sign_in.credential_kind = 'webauthn' THEN 'cnc_live_wa_' 
      ELSE 'cnc_live_tk_' 
    END) || translate(encode(gen_random_bytes(24), 'base64'), '+/=', '-_');
    v_credential_id := uuid_generate_v5(uuid_ns_url(), v_plaintext_credential);
    INSERT INTO myapp_auth_private.session_credentials (
      id,
      session_id,
      kind,
      secret_hash,
      expires_at
    )
    VALUES
      (v_credential_id, v_session_id, sign_in.credential_kind, digest(v_plaintext_credential, 'sha256'), v_session_expires_at);
    SELECT v_credential_id INTO id;
    SELECT v_email.owner_id INTO user_id;
    SELECT v_plaintext_credential INTO access_token;
    SELECT v_session_expires_at INTO access_token_expires_at;
    SELECT v_user_is_verified INTO is_verified;
    SELECT false INTO mfa_required;
    SELECT false INTO totp_enabled;
    IF v_ip_address IS NOT NULL THEN
      DELETE FROM myapp_auth_private.auth_ip_rate_limits
      WHERE
        (ip_address = v_ip_address AND ua_hash = v_ua_hash) AND action = 'sign_in';
      DELETE FROM myapp_auth_private.auth_ip_rate_limits
      WHERE
        (ip_address = v_ip_address AND ua_hash = '') AND action = 'sign_in';
    END IF;
    RETURN;
  ELSE
    INSERT INTO myapp_logging_public.audit_log_auth (
      actor_id,
      event,
      success
    )
    VALUES
      (v_email.owner_id, 'sign_in', false);
    INSERT INTO myapp_auth_private.auth_rate_limits (
      subject_id,
      action,
      attempts,
      first_attempt_at,
      last_attempt_at,
      locked_until
    )
    VALUES
      (v_email.owner_id, 'sign_in', 1, now(), now(), NULL)
    ON CONFLICT (subject_id, action) DO UPDATE SET
    attempts = CASE 
      WHEN auth_rate_limits.first_attempt_at < (now() - v_rate_settings.login_lockout_duration) THEN 1 
      ELSE auth_rate_limits.attempts + 1 
    END, first_attempt_at = CASE 
      WHEN auth_rate_limits.first_attempt_at < (now() - v_rate_settings.login_lockout_duration) THEN now() 
      ELSE auth_rate_limits.first_attempt_at 
    END, last_attempt_at = now(), locked_until = CASE 
      WHEN (auth_rate_limits.attempts + 1) >= v_rate_settings.login_max_attempts AND auth_rate_limits.first_attempt_at >= (now() - v_rate_settings.login_lockout_duration) THEN now() + v_rate_settings.login_lockout_duration 
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
        (v_ip_address, v_ua_hash, 'sign_in', 1, now(), NULL)
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
        (v_ip_address, '', 'sign_in', 1, now(), NULL)
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
    RETURN;
  END IF;
END;
$_PGFN_$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;

