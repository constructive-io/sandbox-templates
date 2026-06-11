-- Deploy: schemas/myapp_profiles_private/schema/default_seq_privs/administrator
-- made with <3 @ constructive.io

-- requires: schemas/myapp_profiles_private/schema


ALTER DEFAULT PRIVILEGES IN SCHEMA myapp_profiles_private GRANT USAGE ON SEQUENCES TO administrator;

