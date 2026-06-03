-- Deploy: schemas/myapp_memberships_public/tables/app_membership_defaults/columns/updated_at/column
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/app_membership_defaults/table


ALTER TABLE myapp_memberships_public.app_membership_defaults 
  ADD COLUMN updated_at timestamptz;

