-- Deploy: schemas/myapp_auth_public/procedures/revoke_api_key/procedure
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_public/schema
-- requires: schemas/myapp_auth_private/tables/sessions/table
-- requires: schemas/myapp_auth_private/tables/session_credentials/table


CREATE FUNCTION myapp_auth_public.revoke_api_key(
  IN key_id uuid
) RETURNS boolean AS $_PGFN_$
DECLARE
  v_user_id uuid;
  v_session_id uuid;
BEGIN
  v_user_id := jwt_public.current_user_id();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'NOT_AUTHENTICATED';
  END IF;
  SELECT sc.session_id
  FROM myapp_auth_private.session_credentials AS sc INNER JOIN myapp_auth_private.sessions AS s ON s.id = sc.session_id
  WHERE
    (sc.id = revoke_api_key.key_id AND sc.kind = 'api_key') AND s.user_id = v_user_id INTO v_session_id;
  IF v_session_id IS NULL THEN
    RAISE EXCEPTION 'API_KEY_NOT_FOUND';
  END IF;
  -- Unknown statement type: PLpgSQL_expr
  -- Unknown statement type: PLpgSQL_expr
  INSERT INTO myapp_logging_public.audit_log_auth (
    actor_id,
    event,
    success
  )
  VALUES
    (v_user_id, 'revoke_api_key', true);
  RETURN true;
END;
$_PGFN_$ LANGUAGE plpgsql VOLATILE STRICT SECURITY DEFINER;

