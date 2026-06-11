-- Deploy: schemas/myapp_auth_private/procedures/authenticate/procedure
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/sessions/table
-- requires: schemas/myapp_auth_private/tables/session_credentials/table


CREATE FUNCTION myapp_auth_private.authenticate(
  IN token_str text
) RETURNS TABLE (
  id uuid,
  user_id uuid,
  session_id uuid,
  access_level text,
  kind text
) AS $_PGFN_$
DECLARE
  v_cred_id uuid;
BEGIN
  SELECT cred.id
  FROM myapp_auth_private.session_credentials AS cred INNER JOIN myapp_auth_private.sessions AS sess ON sess.id = cred.session_id
  WHERE
    (((cred.secret_hash = digest(authenticate.token_str, 'sha256') AND EXTRACT(EPOCH FROM cred.expires_at - now()) > 0) AND cred.revoked_at IS NULL) AND sess.revoked_at IS NULL) AND EXTRACT(EPOCH FROM sess.expires_at - now()) > 0 INTO v_cred_id;
  IF v_cred_id IS NOT NULL THEN
    UPDATE myapp_auth_private.session_credentials AS cred SET
    last_used_at = now()
    WHERE
      cred.id = v_cred_id;
  END IF;
  RETURN QUERY SELECT
    cred.id,
    sess.user_id,
    cred.session_id,
    cred.access_level,
    cred.kind
  FROM myapp_auth_private.session_credentials AS cred INNER JOIN myapp_auth_private.sessions AS sess ON sess.id = cred.session_id
  WHERE
    (((cred.secret_hash = digest(authenticate.token_str, 'sha256') AND EXTRACT(EPOCH FROM cred.expires_at - now()) > 0) AND cred.revoked_at IS NULL) AND sess.revoked_at IS NULL) AND EXTRACT(EPOCH FROM sess.expires_at - now()) > 0;
END;
$_PGFN_$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;

