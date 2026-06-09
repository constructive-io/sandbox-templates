-- Deploy: schemas/myapp_permissions_public/tables/app_permissions/fixtures/fix0000000408
-- made with <3 @ constructive.io

-- requires: schemas/myapp_permissions_public/schema
-- requires: schemas/myapp_permissions_public/tables/app_permissions/table


INSERT INTO myapp_permissions_public.app_permissions (
  bitnum,
  name,
  description
)
VALUES
  (12, 'manage_events', 'Create and manage event types, level definitions, and achievement rules.');

