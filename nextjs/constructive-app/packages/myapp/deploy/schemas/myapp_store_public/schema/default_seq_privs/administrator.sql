-- Deploy: schemas/myapp_store_public/schema/default_seq_privs/administrator
-- made with <3 @ constructive.io

-- requires: schemas/myapp_store_public/schema


ALTER DEFAULT PRIVILEGES IN SCHEMA myapp_store_public GRANT USAGE ON SEQUENCES TO administrator;

