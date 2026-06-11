-- Deploy: schemas/myapp_private/schema/default_seq_privs/authenticated
-- made with <3 @ constructive.io

-- requires: schemas/myapp_private/schema


ALTER DEFAULT PRIVILEGES IN SCHEMA myapp_private GRANT USAGE ON SEQUENCES TO authenticated;

