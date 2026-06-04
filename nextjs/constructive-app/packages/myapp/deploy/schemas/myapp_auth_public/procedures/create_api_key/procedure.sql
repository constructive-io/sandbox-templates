-- Deploy: schemas/myapp_auth_public/procedures/create_api_key/procedure
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_public/schema
-- requires: schemas/myapp_auth_private/tables/sessions/table
-- requires: schemas/myapp_auth_private/tables/app_settings_auth/table
-- requires: schemas/myapp_auth_private/tables/session_credentials/table


CREATE FUNCTION myapp_auth_public.create_api_key(
  IN key_name text,
  IN access_level text DEFAULT 'full_access',
  IN mfa_level text DEFAULT 'none',
  IN expires_in interval DEFAULT NULL,
  OUT api_key text,
  OUT key_id uuid,
  OUT expires_at timestamptz
) RETURNS record AS $_PGFN_$
DECLARE
  v_user_id uuid;
  v_session_id uuid;
  v_credential_id uuid;
  v_plaintext_key text;
  v_settings myapp_auth_private.app_settings_auth;
  v_count int := 0;
  v_effective_duration interval;
  v_expires_at timestamptz;
BEGIN
  v_user_id := jwt_public.current_user_id();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'NOT_AUTHENTICATED';
  END IF;
  SELECT *
  FROM myapp_auth_private.app_settings_auth
  LIMIT
  1 INTO v_settings;
  IF NOT (COALESCE(v_settings.allow_api_keys, true)) THEN
    RAISE EXCEPTION 'API_KEYS_DISABLED';
  END IF;
  IF create_api_key.access_level <> 'full_access' AND create_api_key.access_level <> 'read_only' THEN
    RAISE EXCEPTION 'INVALID_ACCESS_LEVEL';
  END IF;
  IF create_api_key.mfa_level <> 'none' AND create_api_key.mfa_level <> 'verified' THEN
    RAISE EXCEPTION 'INVALID_MFA_LEVEL';
  END IF;
  SELECT count(*)
  FROM myapp_auth_private.session_credentials AS c INNER JOIN myapp_auth_private.sessions AS s ON c.session_id = s.id
  WHERE
    (s.user_id = v_user_id AND c.kind = 'api_key') AND c.revoked_at IS NULL INTO v_count;
  IF NOT (v_count < (COALESCE(v_settings.api_key_max_per_user, 10))) THEN
    RAISE EXCEPTION 'API_KEY_LIMIT_REACHED';
  END IF;
  IF NOT (EXISTS (SELECT 1
  FROM myapp_auth_private.sessions AS s INNER JOIN myapp_auth_private.session_credentials AS c ON c.session_id = s.id
  WHERE
    c.id = jwt_private.current_token_id() AND ((c.mfa_level = 'verified' OR s.last_password_verified > (now() - '30 minutes'::interval)) OR s.last_mfa_verified > (now() - '30 minutes'::interval)))) THEN
    RAISE EXCEPTION 'STEP_UP_REQUIRED';
  END IF;
  v_effective_duration := COALESCE(create_api_key.expires_in, v_settings.api_key_default_duration, '90 days'::interval);
  IF v_settings.api_key_max_duration IS NOT NULL AND v_effective_duration > v_settings.api_key_max_duration THEN
    v_effective_duration := v_settings.api_key_max_duration;
  END IF;
  v_expires_at := now() + v_effective_duration;
  v_session_id := uuidv7();
  INSERT INTO myapp_auth_private.sessions (
    id,
    user_id,
    is_anonymous,
    origin,
    expires_at
  )
  VALUES
    (v_session_id, v_user_id, false, NULL, v_expires_at);
  v_plaintext_key := (CASE 
    WHEN 'api_key' = 'api_key' THEN 'cnc_live_sk_' 
    WHEN 'api_key' = 'bearer' THEN 'cnc_live_bt_' 
    WHEN 'api_key' = 'access_token' THEN 'cnc_live_at_' 
    WHEN 'api_key' = 'mfa_challenge' THEN 'cnc_live_mfa_' 
    WHEN 'api_key' = 'one_time' THEN 'cnc_live_ot_' 
    WHEN 'api_key' = 'webauthn' THEN 'cnc_live_wa_' 
    ELSE 'cnc_live_tk_' 
  END) || translate(encode(gen_random_bytes(24), 'base64'), '+/=', '-_');
  v_credential_id := uuidv7();
  INSERT INTO myapp_auth_private.session_credentials (
    id,
    session_id,
    kind,
    secret_hash,
    mfa_level,
    access_level,
    expires_at,
    name
  )
  VALUES
    (v_credential_id, v_session_id, 'api_key', digest(v_plaintext_key, 'sha256'), create_api_key.mfa_level, create_api_key.access_level, v_expires_at, create_api_key.key_name);
  INSERT INTO myapp_logging_public.audit_log_auth (
    actor_id,
    event,
    success
  )
  VALUES
    (v_user_id, 'create_api_key', true);
  SELECT v_plaintext_key INTO api_key;
  SELECT v_credential_id INTO key_id;
  SELECT v_expires_at INTO expires_at;
  RETURN;
END;
$_PGFN_$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;

