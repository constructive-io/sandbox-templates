-- Deploy: schemas/myapp_infra_public/tables/app_namespaces/grants/authenticated/insert/grant
-- made with <3 @ constructive.io

-- requires: schemas/myapp_infra_public/schema
-- requires: schemas/myapp_infra_public/tables/app_namespaces/table


GRANT INSERT ON myapp_infra_public.app_namespaces TO authenticated;

