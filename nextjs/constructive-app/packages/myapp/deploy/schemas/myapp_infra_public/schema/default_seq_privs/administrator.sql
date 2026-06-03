-- Deploy: schemas/myapp_infra_public/schema/default_seq_privs/administrator
-- made with <3 @ constructive.io

-- requires: schemas/myapp_infra_public/schema


ALTER DEFAULT PRIVILEGES IN SCHEMA myapp_infra_public GRANT USAGE ON SEQUENCES TO administrator;

