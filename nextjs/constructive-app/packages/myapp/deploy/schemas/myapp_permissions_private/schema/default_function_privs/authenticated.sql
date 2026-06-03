-- Deploy: schemas/myapp_permissions_private/schema/default_function_privs/authenticated
-- made with <3 @ constructive.io

-- requires: schemas/myapp_permissions_private/schema


ALTER DEFAULT PRIVILEGES IN SCHEMA myapp_permissions_private GRANT ALL ON FUNCTIONS TO authenticated;

