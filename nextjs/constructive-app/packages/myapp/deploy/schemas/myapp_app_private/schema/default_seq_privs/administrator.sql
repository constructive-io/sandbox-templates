-- Deploy: schemas/myapp_app_private/schema/default_seq_privs/administrator
-- made with <3 @ constructive.io

-- requires: schemas/myapp_app_private/schema


ALTER DEFAULT PRIVILEGES IN SCHEMA myapp_app_private GRANT USAGE ON SEQUENCES TO administrator;

