-- Deploy: schemas/myapp_user_identifiers_public/schema/default_seq_privs/authenticated
-- made with <3 @ constructive.io

-- requires: schemas/myapp_user_identifiers_public/schema


ALTER DEFAULT PRIVILEGES IN SCHEMA myapp_user_identifiers_public GRANT USAGE ON SEQUENCES TO authenticated;

