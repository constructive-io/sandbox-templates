-- Deploy: schemas/myapp_memberships_public/tables/app_membership_defaults/fixtures/fix0000000212
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/app_membership_defaults/table


INSERT INTO myapp_memberships_public.app_membership_defaults (
  is_verified,
  is_approved
)
VALUES
  ('f'::boolean, 'f'::boolean);

