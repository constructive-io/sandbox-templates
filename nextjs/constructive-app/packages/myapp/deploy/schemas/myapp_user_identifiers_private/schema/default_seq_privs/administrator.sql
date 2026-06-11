-- Deploy: schemas/myapp_user_identifiers_private/schema/default_seq_privs/administrator
-- made with <3 @ constructive.io

-- requires: schemas/myapp_user_identifiers_private/schema


ALTER DEFAULT PRIVILEGES IN SCHEMA myapp_user_identifiers_private GRANT USAGE ON SEQUENCES TO administrator;

