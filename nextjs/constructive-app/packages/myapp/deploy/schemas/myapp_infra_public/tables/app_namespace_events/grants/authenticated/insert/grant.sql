-- Deploy: schemas/myapp_infra_public/tables/app_namespace_events/grants/authenticated/insert/grant
-- made with <3 @ constructive.io

-- requires: schemas/myapp_infra_public/schema
-- requires: schemas/myapp_infra_public/tables/app_namespace_events/table


GRANT INSERT ON myapp_infra_public.app_namespace_events TO authenticated;

