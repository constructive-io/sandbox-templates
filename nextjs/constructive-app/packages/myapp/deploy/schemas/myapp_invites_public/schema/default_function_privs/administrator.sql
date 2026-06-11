-- Deploy: schemas/myapp_invites_public/schema/default_function_privs/administrator
-- made with <3 @ constructive.io

-- requires: schemas/myapp_invites_public/schema


ALTER DEFAULT PRIVILEGES IN SCHEMA myapp_invites_public GRANT ALL ON FUNCTIONS TO administrator;

