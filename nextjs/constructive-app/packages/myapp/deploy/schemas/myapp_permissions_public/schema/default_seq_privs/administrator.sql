-- Deploy: schemas/myapp_permissions_public/schema/default_seq_privs/administrator
-- made with <3 @ constructive.io

-- requires: schemas/myapp_permissions_public/schema


ALTER DEFAULT PRIVILEGES IN SCHEMA myapp_permissions_public GRANT USAGE ON SEQUENCES TO administrator;

