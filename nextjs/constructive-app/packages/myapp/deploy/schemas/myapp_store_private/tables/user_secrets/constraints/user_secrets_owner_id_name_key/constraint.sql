-- Deploy: schemas/myapp_store_private/tables/user_secrets/constraints/user_secrets_owner_id_name_key/constraint
-- made with <3 @ constructive.io

-- requires: schemas/myapp_store_private/schema
-- requires: schemas/myapp_store_private/tables/user_secrets/table


ALTER TABLE myapp_store_private.user_secrets 
  ADD CONSTRAINT user_secrets_owner_id_name_key 
    UNIQUE (owner_id, name);

