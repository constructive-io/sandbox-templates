-- Deploy: schemas/myapp_infra_public/tables/app_namespace_events/columns/metadata/alterations/alt0000001392
-- made with <3 @ constructive.io

-- requires: schemas/myapp_infra_public/schema
-- requires: schemas/myapp_infra_public/tables/app_namespace_events/columns/metadata/column


COMMENT ON COLUMN myapp_infra_public.app_namespace_events.metadata IS E'Structured context (old/new values, labels diff, etc.)';

