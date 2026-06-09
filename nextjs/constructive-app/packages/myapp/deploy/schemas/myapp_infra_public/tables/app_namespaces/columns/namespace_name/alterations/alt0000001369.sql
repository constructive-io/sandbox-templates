-- Deploy: schemas/myapp_infra_public/tables/app_namespaces/columns/namespace_name/alterations/alt0000001369
-- made with <3 @ constructive.io

-- requires: schemas/myapp_infra_public/schema
-- requires: schemas/myapp_infra_public/tables/app_namespaces/columns/namespace_name/column


COMMENT ON COLUMN myapp_infra_public.app_namespaces.namespace_name IS E'Globally unique computed namespace identifier via inflection.underscore';

