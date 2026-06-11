-- Deploy: schemas/myapp_permissions_private/schema/default_seq_privs/authenticated
-- made with <3 @ constructive.io

-- requires: schemas/myapp_permissions_private/schema


ALTER DEFAULT PRIVILEGES IN SCHEMA myapp_permissions_private GRANT USAGE ON SEQUENCES TO authenticated;

