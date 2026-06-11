-- Deploy: schemas/myapp_infra_public/tables/app_namespaces/columns/is_active/alterations/alt0000001373
-- made with <3 @ constructive.io

-- requires: schemas/myapp_infra_public/schema
-- requires: schemas/myapp_infra_public/tables/app_namespaces/columns/is_active/column


COMMENT ON COLUMN myapp_infra_public.app_namespaces.is_active IS E'Whether this namespace is active (soft-disable for filtering)';

