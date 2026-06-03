-- Deploy: schemas/myapp_store_private/tables/app_secrets/constraints/app_secrets_pkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/myapp_store_private/schema
-- requires: schemas/myapp_store_private/tables/app_secrets/table


ALTER TABLE myapp_store_private.app_secrets 
  ADD CONSTRAINT app_secrets_pkey PRIMARY KEY (id);

