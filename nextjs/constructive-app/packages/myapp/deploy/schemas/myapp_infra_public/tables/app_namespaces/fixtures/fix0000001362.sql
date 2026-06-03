-- Deploy: schemas/myapp_infra_public/tables/app_namespaces/fixtures/fix0000001362
-- made with <3 @ constructive.io

-- requires: schemas/myapp_infra_public/schema
-- requires: schemas/myapp_infra_public/tables/app_namespaces/table


INSERT INTO myapp_infra_public.app_namespaces (
  name,
  description
)
VALUES
  ('default', 'Default namespace for secrets, config, and function definitions');

