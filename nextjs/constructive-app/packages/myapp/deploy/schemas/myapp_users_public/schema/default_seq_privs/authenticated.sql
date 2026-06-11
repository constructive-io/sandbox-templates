-- Deploy: schemas/myapp_users_public/schema/default_seq_privs/authenticated
-- made with <3 @ constructive.io

-- requires: schemas/myapp_users_public/schema


ALTER DEFAULT PRIVILEGES IN SCHEMA myapp_users_public GRANT USAGE ON SEQUENCES TO authenticated;

