-- Deploy: schemas/myapp_infra_public/tables/app_namespaces/columns/labels/alterations/alt0000001376
-- made with <3 @ constructive.io

-- requires: schemas/myapp_infra_public/schema
-- requires: schemas/myapp_infra_public/tables/app_namespaces/columns/labels/column


COMMENT ON COLUMN myapp_infra_public.app_namespaces.labels IS E'Key/value pairs for selecting and filtering namespaces';

