-- Deploy: schemas/myapp_invites_private/schema/default_seq_privs/authenticated
-- made with <3 @ constructive.io

-- requires: schemas/myapp_invites_private/schema


ALTER DEFAULT PRIVILEGES IN SCHEMA myapp_invites_private GRANT USAGE ON SEQUENCES TO authenticated;

