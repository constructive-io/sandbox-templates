-- Deploy: schemas/myapp_auth_private/schema/default_seq_privs/administrator
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema


ALTER DEFAULT PRIVILEGES IN SCHEMA myapp_auth_private GRANT USAGE ON SEQUENCES TO administrator;

