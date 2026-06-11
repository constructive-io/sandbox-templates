-- Deploy: schemas/myapp_infra_public/tables/app_namespaces/indexes/app_namespaces_created_at_idx
-- made with <3 @ constructive.io

-- requires: schemas/myapp_infra_public/schema
-- requires: schemas/myapp_infra_public/tables/app_namespaces/table
-- requires: schemas/myapp_infra_public/tables/app_namespaces/columns/created_at/column


CREATE INDEX app_namespaces_created_at_idx ON myapp_infra_public.app_namespaces ( created_at );

