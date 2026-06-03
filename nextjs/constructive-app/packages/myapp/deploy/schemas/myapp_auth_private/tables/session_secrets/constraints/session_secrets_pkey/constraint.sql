-- Deploy: schemas/myapp_auth_private/tables/session_secrets/constraints/session_secrets_pkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/session_secrets/table


ALTER TABLE myapp_auth_private.session_secrets 
  ADD CONSTRAINT session_secrets_pkey PRIMARY KEY (id);

