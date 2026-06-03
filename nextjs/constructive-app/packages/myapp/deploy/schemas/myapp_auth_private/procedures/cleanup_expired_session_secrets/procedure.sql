-- Deploy: schemas/myapp_auth_private/procedures/cleanup_expired_session_secrets/procedure
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/session_secrets/table


CREATE FUNCTION myapp_auth_private.cleanup_expired_session_secrets() RETURNS void AS $_PGFN_$
BEGIN
  DELETE FROM myapp_auth_private.session_secrets AS s
  WHERE
    s.expires_at IS NOT NULL AND s.expires_at < now();
END;
$_PGFN_$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;

