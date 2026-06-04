-- Deploy: schemas/myapp_memberships_public/schema/default_seq_privs/authenticated
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema


ALTER DEFAULT PRIVILEGES IN SCHEMA myapp_memberships_public GRANT USAGE ON SEQUENCES TO authenticated;

