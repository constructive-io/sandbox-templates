-- Deploy: schemas/myapp_auth_public/procedures/revoke_session/procedure
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_public/schema
-- requires: schemas/myapp_auth_private/tables/sessions/table
-- requires: schemas/myapp_auth_private/tables/session_credentials/table


CREATE FUNCTION myapp_auth_public.revoke_session(
  IN session_id uuid
) RETURNS boolean AS $_PGFN_$
DECLARE
  v_user_id uuid;
  v_current_session uuid;
BEGIN
  v_user_id := jwt_public.current_user_id();
  v_current_session := jwt_private.current_session_id();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'NOT_AUTHENTICATED';
  END IF;
  IF revoke_session.session_id = v_current_session THEN
    RAISE EXCEPTION 'CANNOT_REVOKE_CURRENT_SESSION';
  END IF;
  -- Unknown statement type: PLpgSQL_expr
  -- Unknown statement type: PLpgSQL_expr
  IF NOT (FOUND) THEN
    RAISE EXCEPTION 'SESSION_NOT_FOUND';
  END IF;
  INSERT INTO myapp_logging_public.audit_log_auth (
    actor_id,
    event,
    success
  )
  VALUES
    (v_user_id, 'revoke_session', true);
  RETURN true;
END;
$_PGFN_$ LANGUAGE plpgsql VOLATILE STRICT SECURITY DEFINER;

