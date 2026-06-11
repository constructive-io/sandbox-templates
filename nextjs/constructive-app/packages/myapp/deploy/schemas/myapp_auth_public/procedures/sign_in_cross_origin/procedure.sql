-- Deploy: schemas/myapp_auth_public/procedures/sign_in_cross_origin/procedure
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_public/schema
-- requires: schemas/myapp_auth_private/tables/sessions/table
-- requires: schemas/myapp_user_identifiers_public/tables/emails/table
-- requires: schemas/myapp_auth_private/tables/auth_ip_rate_limits/table
-- requires: schemas/myapp_auth_private/tables/session_credentials/table
-- requires: schemas/myapp_memberships_public/tables/app_memberships/table
-- requires: schemas/myapp_auth_private/tables/app_settings_rate_limit/table


CREATE FUNCTION myapp_auth_public.sign_in_cross_origin(
  IN token text,
  IN credential_kind text DEFAULT 'bearer',
  OUT id uuid,
  OUT user_id uuid,
  OUT access_token text,
  OUT access_token_expires_at timestamptz,
  OUT is_verified boolean,
  OUT totp_enabled boolean
) AS $_PGFN_$
DECLARE
  v_credential_id uuid;
  v_session_id uuid;
  v_user_id uuid;
  v_plaintext_credential text;
  v_expires_at timestamptz;
  v_user_is_verified boolean := false;
  v_totp_enabled boolean := false;
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
    PERFORM pg_advisory_xact_lock(hashtext('ip_rate_limit_sign_in_cross_origin'), hashtext(v_ip_address::text));
    IF EXISTS (SELECT 1
    FROM myapp_auth_private.auth_ip_rate_limits
    WHERE
      ((ip_address = v_ip_address AND ua_hash = ANY( ARRAY[v_ua_hash, ''] )) AND action = 'sign_in_cross_origin') AND locked_until > now()
    LIMIT
    1) THEN
      RAISE EXCEPTION 'TOO_MANY_REQUESTS';
    END IF;
  END IF;
  SELECT
    c.id,
    c.session_id,
    s.user_id,
    c.expires_at
  FROM myapp_auth_private.session_credentials AS c INNER JOIN myapp_auth_private.sessions AS s ON s.id = c.session_id
  WHERE
    ((((c.ot_token = sign_in_cross_origin.token AND c.revoked_at IS NULL) AND s.revoked_at IS NULL) AND (c.expires_at IS NULL OR c.expires_at > now())) AND CASE s.uagent IS NULL 
        WHEN true THEN jwt_public.current_user_agent() IS NULL 
        ELSE s.uagent = jwt_public.current_user_agent() 
      END) AND CASE s.origin IS NULL 
        WHEN true THEN jwt_public.current_origin() IS NULL 
        ELSE s.origin = jwt_public.current_origin() 
      END INTO v_credential_id, v_session_id, v_user_id, v_expires_at;
  IF NOT (FOUND) THEN
    RETURN;
  END IF;
  v_plaintext_credential := (CASE 
    WHEN sign_in_cross_origin.credential_kind = 'api_key' THEN 'cnc_live_sk_' 
    WHEN sign_in_cross_origin.credential_kind = 'bearer' THEN 'cnc_live_bt_' 
    WHEN sign_in_cross_origin.credential_kind = 'access_token' THEN 'cnc_live_at_' 
    WHEN sign_in_cross_origin.credential_kind = 'mfa_challenge' THEN 'cnc_live_mfa_' 
    WHEN sign_in_cross_origin.credential_kind = 'one_time' THEN 'cnc_live_ot_' 
    WHEN sign_in_cross_origin.credential_kind = 'webauthn' THEN 'cnc_live_wa_' 
    ELSE 'cnc_live_tk_' 
  END) || translate(encode(gen_random_bytes(24), 'base64'), '+/=', '-_');
  UPDATE myapp_auth_private.session_credentials AS c SET
  id = uuid_generate_v5(uuid_ns_url(), v_plaintext_credential), ot_token = NULL, secret_hash = digest(v_plaintext_credential, 'sha256'), kind = sign_in_cross_origin.credential_kind
  WHERE
    c.id = v_credential_id
  RETURNING c.id INTO v_credential_id;
  SELECT mem.is_verified
  FROM myapp_memberships_public.app_memberships AS mem
  WHERE
    mem.actor_id = v_user_id INTO v_user_is_verified;
  SELECT v_credential_id INTO id;
  SELECT v_user_id INTO user_id;
  SELECT v_plaintext_credential INTO access_token;
  SELECT v_expires_at INTO access_token_expires_at;
  SELECT
    COALESCE(v_user_is_verified, false) INTO is_verified;
  SELECT false INTO totp_enabled;
  RETURN;
END;
$_PGFN_$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;

