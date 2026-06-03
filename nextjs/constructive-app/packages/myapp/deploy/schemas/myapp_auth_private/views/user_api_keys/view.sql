-- Deploy: schemas/myapp_auth_private/views/user_api_keys/view
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema


CREATE VIEW myapp_auth_private.user_api_keys WITH ( security_invoker = true ) AS SELECT
  sc.id,
  sc.key_id,
  sc.name,
  sc.expires_at,
  sc.revoked_at,
  sc.last_used_at,
  sc.org_id,
  sc.mfa_level,
  sc.access_level,
  sc.created_at,
  sc.updated_at
FROM myapp_auth_private.session_credentials AS sc INNER JOIN myapp_auth_private.sessions AS s ON s.id = sc.session_id
WHERE
  sc.kind = 'api_key' AND s.user_id = jwt_public.current_user_id();

