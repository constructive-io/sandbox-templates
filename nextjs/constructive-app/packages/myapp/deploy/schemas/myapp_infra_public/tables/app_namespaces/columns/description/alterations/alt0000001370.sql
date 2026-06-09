-- Deploy: schemas/myapp_infra_public/tables/app_namespaces/columns/description/alterations/alt0000001370
-- made with <3 @ constructive.io

-- requires: schemas/myapp_infra_public/schema
-- requires: schemas/myapp_infra_public/tables/app_namespaces/columns/description/column


COMMENT ON COLUMN myapp_infra_public.app_namespaces.description IS E'Optional human-readable description of this namespace';

