-- Deploy: schemas/myapp_store_private/tables/user_secrets/constraints/user_secrets_pkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/myapp_store_private/schema
-- requires: schemas/myapp_store_private/tables/user_secrets/table


ALTER TABLE myapp_store_private.user_secrets 
  ADD CONSTRAINT user_secrets_pkey PRIMARY KEY (id);

