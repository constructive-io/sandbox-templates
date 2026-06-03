-- Deploy: schemas/myapp_auth_public/procedures/request_cross_origin_token/procedure
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_public/schema
-- requires: schemas/myapp_store_private/schema
-- requires: schemas/myapp_store_private/schema
-- requires: schemas/myapp_auth_private/tables/sessions/table
-- requires: schemas/myapp_user_identifiers_public/tables/emails/table
-- requires: schemas/myapp_auth_private/tables/auth_ip_rate_limits/table
-- requires: schemas/myapp_auth_private/tables/session_credentials/table
-- requires: schemas/myapp_auth_private/tables/app_settings_rate_limit/table


CREATE FUNCTION myapp_auth_public.request_cross_origin_token(
  IN email text,
  IN password text,
  IN origin origin,
  IN remember_me boolean DEFAULT false
) RETURNS text AS $_PGFN_$
DECLARE
  v_credential_id uuid;
  v_session_id uuid;
  v_ot_token text;
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
    PERFORM pg_advisory_xact_lock(hashtext('ip_rate_limit_request_cross_origin_token'), hashtext(v_ip_address::text));
    IF EXISTS (SELECT 1
    FROM myapp_auth_private.auth_ip_rate_limits
    WHERE
      ((ip_address = v_ip_address AND ua_hash = ANY( ARRAY[v_ua_hash, ''] )) AND action = 'request_cross_origin_token') AND locked_until > now()
    LIMIT
    1) THEN
      RAISE EXCEPTION 'TOO_MANY_REQUESTS';
    END IF;
  END IF;
  SELECT si.id
  FROM myapp_auth_public.sign_in(request_cross_origin_token.email, request_cross_origin_token.password, request_cross_origin_token.remember_me) AS si INTO v_credential_id;
  IF v_credential_id IS NULL THEN
    RETURN NULL;
  END IF;
  SELECT c.session_id
  FROM myapp_auth_private.session_credentials AS c
  WHERE
    c.id = v_credential_id INTO v_session_id;
  v_ot_token := (CASE 
    WHEN 'one_time' = 'api_key' THEN 'cnc_live_sk_' 
    WHEN 'one_time' = 'bearer' THEN 'cnc_live_bt_' 
    WHEN 'one_time' = 'access_token' THEN 'cnc_live_at_' 
    WHEN 'one_time' = 'mfa_challenge' THEN 'cnc_live_mfa_' 
    WHEN 'one_time' = 'one_time' THEN 'cnc_live_ot_' 
    WHEN 'one_time' = 'webauthn' THEN 'cnc_live_wa_' 
    ELSE 'cnc_live_tk_' 
  END) || translate(encode(gen_random_bytes(24), 'base64'), '+/=', '-_');
  UPDATE myapp_auth_private.session_credentials AS c SET
  ot_token = v_ot_token
  WHERE
    c.id = v_credential_id;
  UPDATE myapp_auth_private.sessions AS s SET
  origin = request_cross_origin_token.origin
  WHERE
    s.id = v_session_id;
  RETURN lower(replace(base32.encode(v_ot_token), '=', ''));
END;
$_PGFN_$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;

