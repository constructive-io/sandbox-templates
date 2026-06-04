-- Deploy: schemas/myapp_infra_public/tables/app_namespace_events/grants/authenticated/update/grant
-- made with <3 @ constructive.io

-- requires: schemas/myapp_infra_public/schema
-- requires: schemas/myapp_infra_public/tables/app_namespace_events/table


GRANT UPDATE ON myapp_infra_public.app_namespace_events TO authenticated;

