-- Deploy: schemas/myapp_public/schema/default_function_privs/authenticated
-- made with <3 @ constructive.io

-- requires: schemas/myapp_public/schema


ALTER DEFAULT PRIVILEGES IN SCHEMA myapp_public GRANT ALL ON FUNCTIONS TO authenticated;

