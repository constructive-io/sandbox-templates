-- Deploy: schemas/myapp_auth_private/procedures/get_session_secret/procedure
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/session_secrets/table


CREATE FUNCTION myapp_auth_private.get_session_secret(
  IN v_session_id uuid,
  IN v_name text
) RETURNS text AS $_PGFN_$
DECLARE
  val text;
BEGIN
  SELECT s.value
  FROM myapp_auth_private.session_secrets AS s
  WHERE
    (s.session_id = get_session_secret.v_session_id AND s.name = get_session_secret.v_name) AND (s.expires_at IS NULL OR s.expires_at > now()) INTO val;
  IF NOT (FOUND) OR val IS NULL THEN
    RETURN NULL;
  END IF;
  RETURN val;
END;
$_PGFN_$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

