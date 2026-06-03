-- Deploy: schemas/myapp_auth_public/schema/default_seq_privs/authenticated
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_public/schema


ALTER DEFAULT PRIVILEGES IN SCHEMA myapp_auth_public GRANT USAGE ON SEQUENCES TO authenticated;

