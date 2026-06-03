-- Deploy: schemas/myapp_infra_public/tables/app_namespaces/columns/name/alterations/alt0000001328
-- made with <3 @ constructive.io

-- requires: schemas/myapp_infra_public/schema
-- requires: schemas/myapp_infra_public/tables/app_namespaces/columns/name/column


COMMENT ON COLUMN myapp_infra_public.app_namespaces.name IS E'Human-readable namespace name (e.g. default, production, oauth)';

