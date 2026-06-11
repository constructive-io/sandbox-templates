-- Deploy: schemas/myapp_infra_public/tables/app_namespaces/grants/authenticated/select/grant
-- made with <3 @ constructive.io

-- requires: schemas/myapp_infra_public/schema
-- requires: schemas/myapp_infra_public/tables/app_namespaces/table


GRANT SELECT ON myapp_infra_public.app_namespaces TO authenticated;

