-- Deploy: schemas/myapp_permissions_public/tables/app_permissions/fixtures/fix0000001402
-- made with <3 @ constructive.io

-- requires: schemas/myapp_permissions_public/schema
-- requires: schemas/myapp_permissions_public/tables/app_permissions/table


INSERT INTO myapp_permissions_public.app_permissions (
  bitnum,
  name,
  description
)
VALUES
  (13, 'manage_namespaces', 'Create, rename, and delete namespaces.');

