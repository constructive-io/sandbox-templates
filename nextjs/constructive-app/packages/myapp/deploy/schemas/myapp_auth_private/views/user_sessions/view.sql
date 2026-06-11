-- Deploy: schemas/myapp_auth_private/views/user_sessions/view
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema


CREATE VIEW myapp_auth_private.user_sessions WITH ( security_invoker = true ) AS SELECT
  id,
  user_id,
  auth_method,
  expires_at,
  revoked_at,
  origin,
  ip,
  uagent,
  fingerprint_mode,
  last_password_verified,
  last_mfa_verified,
  created_at,
  updated_at
FROM myapp_auth_private.sessions
WHERE
  user_id = jwt_public.current_user_id();

