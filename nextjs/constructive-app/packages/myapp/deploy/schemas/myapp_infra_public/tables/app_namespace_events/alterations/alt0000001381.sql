-- Deploy: schemas/myapp_infra_public/tables/app_namespace_events/alterations/alt0000001381
-- made with <3 @ constructive.io

-- requires: schemas/myapp_infra_public/schema
-- requires: schemas/myapp_infra_public/tables/app_namespace_events/table


COMMENT ON TABLE myapp_infra_public.app_namespace_events IS E'Namespace lifecycle events — audit log of creation, activation, deactivation, label changes';

