-- Deploy: schemas/myapp_auth_private/procedures/del_session_secret/procedure
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/session_secrets/table


CREATE FUNCTION myapp_auth_private.del_session_secret(
  IN v_session_id uuid,
  IN v_name text
) RETURNS void AS $_PGFN_$
BEGIN
  DELETE FROM myapp_auth_private.session_secrets AS s
  WHERE
    s.session_id = del_session_secret.v_session_id AND s.name = del_session_secret.v_name;
END;
$_PGFN_$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;

