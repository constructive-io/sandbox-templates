-- Deploy: schemas/myapp_permissions_public/tables/app_permissions/fixtures/fix0000000298
-- made with <3 @ constructive.io

-- requires: schemas/myapp_permissions_public/schema
-- requires: schemas/myapp_permissions_public/tables/app_permissions/table


INSERT INTO myapp_permissions_public.app_permissions (
  bitnum,
  name,
  description
)
VALUES
  (1, 'admin_members', 'Manage members of the app.'),
  (2, 'create_invites', 'Create invites for the app.'),
  (3, 'admin_invites', 'Approve invites of the app.'),
  (4, 'send_approved_invites', 'Invites sent by this user are pre-approved.'),
  (5, 'create_entity', 'Create organization entities.'),
  (6, 'admin_limits', 'Manage limits within the app.'),
  (7, 'admin_permissions', 'Manage permissions within the app.'),
  (8, 'admin_levels', 'Manage levels of the app.'),
  (9, 'assign_profiles', 'Assign profiles (roles) to invites for the app.'),
  (10, 'add_credits', 'Add credits to limits and billing meters.'),
  (11, 'manage_secrets', 'Manage encrypted secrets for the app.');

