-- Deploy: schemas/myapp_memberships_public/tables/membership_types/fixtures/fix0000000028
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/membership_types/table


INSERT INTO myapp_memberships_public.membership_types (
  id,
  name,
  description,
  scope,
  parent_membership_type,
  has_users_table_entry
)
VALUES
  (1, 'App Member', 'Memberships to the app.', 'app', NULL, 'f'::boolean),
  (2, 'Organization Member', 'Membership to an organization.', 'org', 1, 't'::boolean);

