-- Deploy: schemas/myapp_auth_public/procedures/send_account_deletion_email/procedure
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_public/schema
-- requires: schemas/myapp_store_private/schema
-- requires: schemas/myapp_auth_private/tables/auth_rate_limits/table
-- requires: schemas/myapp_auth_private/tables/app_settings_rate_limit/table


CREATE FUNCTION myapp_auth_public.send_account_deletion_email() RETURNS boolean AS $_PGFN_$
DECLARE
  v_email myapp_user_identifiers_public.emails;
  v_deletion_token text;
  v_user_id uuid := jwt_public.current_user_id();
  v_max_duration interval := '3 days'::interval;
  v_rate_settings myapp_auth_private.app_settings_rate_limit;
  v_user_rate_limit myapp_auth_private.auth_rate_limits;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN false;
  END IF;
  SELECT *
  FROM myapp_auth_private.app_settings_rate_limit
  LIMIT
  1 INTO v_rate_settings;
  SELECT *
  FROM myapp_user_identifiers_public.emails AS e
  WHERE
    e.owner_id = v_user_id
  ORDER BY
    is_primary DESC,
    is_verified DESC
  LIMIT
  1 INTO v_email;
  IF NOT (FOUND) THEN
    RETURN false;
  END IF;
  v_user_id := v_email.owner_id;
  SELECT *
  FROM myapp_auth_private.auth_rate_limits
  WHERE
    subject_id = v_user_id AND action = 'account_deletion_request' INTO v_user_rate_limit;
  IF v_user_rate_limit.last_attempt_at IS NOT NULL AND now() < (v_user_rate_limit.last_attempt_at + v_rate_settings.email_cooldown_period) THEN
    RETURN false;
  END IF;
  v_deletion_token := encode(gen_random_bytes(7), 'hex');
  PERFORM myapp_store_private.user_secrets_set(v_user_id, 'account_deletion_token', v_deletion_token, 'crypt');
  INSERT INTO myapp_auth_private.auth_rate_limits (
    subject_id,
    action,
    attempts,
    first_attempt_at,
    last_attempt_at
  )
  VALUES
    (v_user_id, 'account_deletion_request', 0, now(), now())
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
    (v_user_id, 'account_deletion', 0, now(), now())
  ON CONFLICT (subject_id, action) DO UPDATE SET
  last_attempt_at = now();
  PERFORM app_jobs.add_job('email:send_verification_link', json_build_object('email_type', 'account_deletion', 'user_id', v_user_id, 'email', v_email.email::text, 'account_deletion_token', v_deletion_token));
  RETURN true;
END;
$_PGFN_$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;

