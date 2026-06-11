-- Deploy: schemas/myapp_permissions_public/tables/org_permissions/fixtures/fix0000001017
-- made with <3 @ constructive.io

-- requires: schemas/myapp_permissions_public/schema
-- requires: schemas/myapp_permissions_public/tables/org_permissions/table


INSERT INTO myapp_permissions_public.org_permissions (
  bitnum,
  name,
  description
)
VALUES
  (15, 'manage_events', 'Create and manage event types, level definitions, and achievement rules.');

