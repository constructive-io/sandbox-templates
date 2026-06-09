-- Deploy: schemas/myapp_auth_public/procedures/send_verification_email/procedure
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_public/schema
-- requires: schemas/myapp_store_private/schema
-- requires: schemas/myapp_auth_private/tables/auth_rate_limits/table
-- requires: schemas/myapp_user_identifiers_public/tables/emails/table
-- requires: schemas/myapp_auth_private/tables/auth_ip_rate_limits/table
-- requires: schemas/myapp_auth_private/tables/app_settings_rate_limit/table


CREATE FUNCTION myapp_auth_public.send_verification_email(
  IN email email
) RETURNS boolean AS $_PGFN_$
DECLARE
  v_email myapp_user_identifiers_public.emails;
  v_user_id uuid;
  v_verification_token text;
  v_verification_min_duration_between_new_tokens interval := '10 minutes'::interval;
  verification_token_name text;
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
    PERFORM pg_advisory_xact_lock(hashtext('ip_rate_limit_email_verification_request'), hashtext(v_ip_address::text));
    IF EXISTS (SELECT 1
    FROM myapp_auth_private.auth_ip_rate_limits
    WHERE
      ((ip_address = v_ip_address AND ua_hash = ANY( ARRAY[v_ua_hash, ''] )) AND action = 'email_verification_request') AND locked_until > now()
    LIMIT
    1) THEN
      RAISE EXCEPTION 'TOO_MANY_REQUESTS';
    END IF;
  END IF;
  SELECT *
  FROM myapp_user_identifiers_public.emails AS e
  WHERE
    e.email = send_verification_email.email INTO v_email;
  IF NOT (FOUND) THEN
    RETURN false;
  END IF;
  verification_token_name := v_email.email::text || '_verification_token';
  IF v_email.is_verified IS TRUE THEN
    DELETE FROM myapp_auth_private.auth_rate_limits
    WHERE
      subject_id = v_email.owner_id AND action = 'email_verification_request';
    PERFORM myapp_store_private.user_secrets_del(v_email.owner_id, ARRAY[verification_token_name]);
    RETURN false;
  END IF;
  v_user_id := v_email.owner_id;
  SELECT *
  FROM myapp_auth_private.auth_rate_limits
  WHERE
    subject_id = v_user_id AND action = 'email_verification_request' INTO v_user_rate_limit;
  IF v_user_rate_limit.last_attempt_at IS NOT NULL AND now() < (v_user_rate_limit.last_attempt_at + v_rate_settings.email_cooldown_period) THEN
    RETURN NULL;
  END IF;
  IF v_user_rate_limit.last_attempt_at IS NOT NULL AND now() < (v_user_rate_limit.last_attempt_at + v_verification_min_duration_between_new_tokens) THEN
    v_verification_token := myapp_store_private.user_secrets_get(v_user_id, verification_token_name, encode(gen_random_bytes(10), 'hex'));
  ELSE
    v_verification_token := encode(gen_random_bytes(10), 'hex');
  END IF;
  INSERT INTO myapp_auth_private.auth_rate_limits (
    subject_id,
    action,
    attempts,
    first_attempt_at,
    last_attempt_at
  )
  VALUES
    (v_user_id, 'email_verification_request', 0, now(), now())
  ON CONFLICT (subject_id, action) DO UPDATE SET
  last_attempt_at = now();
  INSERT INTO myapp_auth_private.auth_rate_limits (
    subject_id,
    action,
    attempts,
    first_attempt_at,
    last_attempt_at
  )
  VALUES
    (v_user_id, 'email_verification', 0, now(), now())
  ON CONFLICT (subject_id, action) DO UPDATE SET
  last_attempt_at = now();
  PERFORM myapp_store_private.user_secrets_set(v_user_id, verification_token_name, v_verification_token, 'pgp');
  PERFORM app_jobs.add_job('email:send_verification_link', json_build_object('email_type', 'email_verification', 'email_id', v_email.id, 'email', email, 'verification_token', v_verification_token));
  RETURN true;
END;
$_PGFN_$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;

