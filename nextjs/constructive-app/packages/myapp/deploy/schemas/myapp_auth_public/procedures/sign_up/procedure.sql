-- Deploy: schemas/myapp_auth_public/procedures/sign_up/procedure
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_public/schema
-- requires: schemas/myapp_users_public/tables/users/table
-- requires: schemas/myapp_auth_private/tables/sessions/table
-- requires: schemas/myapp_auth_private/tables/app_settings_auth/table
-- requires: schemas/myapp_user_identifiers_public/tables/emails/table
-- requires: schemas/myapp_auth_private/tables/auth_ip_rate_limits/table
-- requires: schemas/myapp_auth_private/tables/session_credentials/table
-- requires: schemas/myapp_memberships_public/tables/app_memberships/table
-- requires: schemas/myapp_auth_private/tables/app_settings_rate_limit/table


CREATE FUNCTION myapp_auth_public.sign_up(
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
  OUT totp_enabled boolean
) AS $_PGFN_$
DECLARE
  v_user myapp_users_public.users;
  v_email myapp_user_identifiers_public.emails;
  v_session_id uuid;
  v_credential_id uuid;
  v_plaintext_credential text;
  v_csrf_secret text;
  v_anon_session myapp_auth_private.sessions;
  v_session_expires_at timestamptz;
  v_settings myapp_auth_private.app_settings_auth;
  v_default_session_duration interval := '2 weeks'::interval;
  v_remember_me_duration interval := '30 days'::interval;
  v_require_csrf boolean := false;
  v_min_password_length int := 8;
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
    PERFORM pg_advisory_xact_lock(hashtext('ip_rate_limit_sign_up'), hashtext(v_ip_address::text));
    IF EXISTS (SELECT 1
    FROM myapp_auth_private.auth_ip_rate_limits
    WHERE
      ((ip_address = v_ip_address AND ua_hash = ANY( ARRAY[v_ua_hash, ''] )) AND action = 'sign_up') AND locked_until > now()
    LIMIT
    1) THEN
      RAISE EXCEPTION 'TOO_MANY_REQUESTS';
    END IF;
  END IF;
  SELECT *
  FROM myapp_auth_private.app_settings_auth
  LIMIT
  1 INTO v_settings;
  IF NOT (COALESCE(v_settings.allow_password_sign_up, true)) THEN
    RAISE EXCEPTION 'PASSWORD_SIGN_UP_DISABLED';
  END IF;
  IF v_settings.allowed_auth_methods IS NOT NULL AND NOT ('password' = ANY( v_settings.allowed_auth_methods )) THEN
    RAISE EXCEPTION 'AUTH_METHOD_NOT_ALLOWED';
  END IF;
  v_default_session_duration := COALESCE(v_settings.default_session_duration, '2 weeks'::interval);
  v_remember_me_duration := COALESCE(v_settings.remember_me_duration, '30 days'::interval);
  v_require_csrf := COALESCE(v_settings.require_csrf_for_auth, false);
  v_min_password_length := COALESCE(v_settings.min_password_length, 8);
  IF v_require_csrf AND sign_up.csrf_token IS NULL THEN
    RAISE EXCEPTION 'CSRF_TOKEN_REQUIRED';
  END IF;
  IF sign_up.csrf_token IS NOT NULL THEN
    SELECT s.*
    FROM myapp_auth_private.sessions AS s
    WHERE
      ((s.csrf_secret = sign_up.csrf_token AND s.is_anonymous = true) AND s.revoked_at IS NULL) AND s.expires_at > now() INTO v_anon_session;
    IF NOT (FOUND) THEN
      RAISE EXCEPTION 'INVALID_CSRF_TOKEN';
    END IF;
  END IF;
  PERFORM myapp_auth_public.check_password(sign_up.password);
  SELECT trim(sign_up.password) INTO password;
  SELECT *
  FROM myapp_user_identifiers_public.emails AS t
  WHERE
    (trim(sign_up.email))::email = t.email INTO v_email;
  IF NOT (FOUND) THEN
    INSERT INTO myapp_users_public.users
    VALUES
      (DEFAULT)
    RETURNING * INTO v_user;
    INSERT INTO myapp_user_identifiers_public.emails (
      owner_id,
      email
    )
    VALUES
      (v_user.id, trim(sign_up.email))
    RETURNING * INTO v_email;
    PERFORM myapp_store_private.user_secrets_set(v_user.id, 'password_hash', trim(sign_up.password), 'crypt');
    PERFORM myapp_store_private.user_state_set(v_user.id, 'primary_auth_method', 'password'::text);
    IF v_anon_session.id IS NOT NULL THEN
      UPDATE myapp_auth_private.sessions SET
      revoked_at = now()
      WHERE
        id = v_anon_session.id;
    END IF;
    v_csrf_secret := encode(gen_random_bytes(32), 'hex');
    v_session_id := uuidv7();
    IF sign_up.remember_me IS TRUE THEN
      v_session_expires_at := now() + v_remember_me_duration;
    ELSE
      v_session_expires_at := now() + v_default_session_duration;
    END IF;
    INSERT INTO myapp_auth_private.sessions (
      id,
      user_id,
      is_anonymous,
      expires_at,
      csrf_secret
    )
    VALUES
      (v_session_id, v_user.id, false, v_session_expires_at, v_csrf_secret);
    v_plaintext_credential := (CASE 
      WHEN sign_up.credential_kind = 'api_key' THEN 'cnc_live_sk_' 
      WHEN sign_up.credential_kind = 'bearer' THEN 'cnc_live_bt_' 
      WHEN sign_up.credential_kind = 'access_token' THEN 'cnc_live_at_' 
      WHEN sign_up.credential_kind = 'mfa_challenge' THEN 'cnc_live_mfa_' 
      WHEN sign_up.credential_kind = 'one_time' THEN 'cnc_live_ot_' 
      WHEN sign_up.credential_kind = 'webauthn' THEN 'cnc_live_wa_' 
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
      (v_credential_id, v_session_id, sign_up.credential_kind, digest(v_plaintext_credential, 'sha256'), v_session_expires_at);
    SELECT v_credential_id INTO id;
    SELECT v_user.id INTO user_id;
    SELECT v_plaintext_credential INTO access_token;
    SELECT v_session_expires_at INTO access_token_expires_at;
    SELECT false INTO is_verified;
    SELECT false INTO totp_enabled;
    IF v_ip_address IS NOT NULL THEN
      DELETE FROM myapp_auth_private.auth_ip_rate_limits
      WHERE
        (ip_address = v_ip_address AND ua_hash = v_ua_hash) AND action = 'sign_up';
      DELETE FROM myapp_auth_private.auth_ip_rate_limits
      WHERE
        (ip_address = v_ip_address AND ua_hash = '') AND action = 'sign_up';
    END IF;
    RETURN;
  ELSE
    RAISE EXCEPTION 'ACCOUNT_EXISTS';
  END IF;
END;
$_PGFN_$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;

