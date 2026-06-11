-- Deploy: schemas/myapp_infra_public/tables/app_namespaces/alterations/alt0000001361
-- made with <3 @ constructive.io

-- requires: schemas/myapp_infra_public/schema
-- requires: schemas/myapp_infra_public/tables/app_namespaces/table


COMMENT ON TABLE myapp_infra_public.app_namespaces IS E'Logical namespace containers for grouping secrets, config, functions, and other resources';

