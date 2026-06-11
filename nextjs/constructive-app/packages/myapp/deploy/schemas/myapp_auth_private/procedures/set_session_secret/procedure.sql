-- Deploy: schemas/myapp_auth_private/procedures/set_session_secret/procedure
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/session_secrets/table


CREATE FUNCTION myapp_auth_private.set_session_secret(
  IN v_session_id uuid,
  IN v_name text,
  IN v_value text,
  IN v_expires_at timestamptz DEFAULT NULL
) RETURNS void AS $_PGFN_$
BEGIN
  INSERT INTO myapp_auth_private.session_secrets (
    session_id,
    name,
    value,
    expires_at
  )
  VALUES
    (set_session_secret.v_session_id, set_session_secret.v_name, set_session_secret.v_value, set_session_secret.v_expires_at)
  ON CONFLICT (session_id, name) DO UPDATE SET
  value = EXCLUDED.value, expires_at = EXCLUDED.expires_at;
END;
$_PGFN_$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;

