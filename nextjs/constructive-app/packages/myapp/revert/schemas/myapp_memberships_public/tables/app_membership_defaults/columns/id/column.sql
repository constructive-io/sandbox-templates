-- Revert: schemas/myapp_memberships_public/tables/app_membership_defaults/columns/id/column


ALTER TABLE myapp_memberships_public.app_membership_defaults 
  DROP COLUMN id RESTRICT;


