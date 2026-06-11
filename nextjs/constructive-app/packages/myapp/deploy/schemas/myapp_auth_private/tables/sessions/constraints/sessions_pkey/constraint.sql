-- Deploy: schemas/myapp_auth_private/tables/sessions/constraints/sessions_pkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/sessions/table


ALTER TABLE myapp_auth_private.sessions 
  ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);

