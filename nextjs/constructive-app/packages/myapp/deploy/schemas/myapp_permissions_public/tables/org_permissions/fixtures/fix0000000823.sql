-- Deploy: schemas/myapp_permissions_public/tables/org_permissions/fixtures/fix0000000823
-- made with <3 @ constructive.io

-- requires: schemas/myapp_permissions_public/schema
-- requires: schemas/myapp_permissions_public/tables/org_permissions/table


INSERT INTO myapp_permissions_public.org_permissions (
  bitnum,
  name,
  description
)
VALUES
  (1, 'admin_members', 'Manage members of the organization.'),
  (2, 'create_invites', 'Create invites for the organization.'),
  (3, 'admin_invites', 'Manage invites of the organization.'),
  (4, 'send_approved_invites', 'Invites sent by this user are pre-approved.'),
  (5, 'create_entity', 'Create child entities.'),
  (6, 'admin_limits', 'Manage limits within the organization.'),
  (7, 'admin_permissions', 'Manage permissions within the organization.'),
  (8, 'admin_levels', 'Manage levels of the organization.'),
  (9, 'admin_account', 'Manage account of the organization.'),
  (10, 'assign_profiles', 'Assign profiles (roles) to invites for the organization.'),
  (11, 'manage_secrets', 'Manage encrypted secrets for the organization.'),
  (12, 'manage_database', 'Manage database schema definitions (tables, fields, views, etc.).'),
  (13, 'manage_services', 'Manage API configuration (endpoints, CORS, auth settings, etc.).'),
  (14, 'manage_sites', 'Manage sites, apps, domains, and site configuration.');

