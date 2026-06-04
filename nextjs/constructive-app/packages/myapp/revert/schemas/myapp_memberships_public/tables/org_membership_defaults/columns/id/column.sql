-- Revert: schemas/myapp_memberships_public/tables/org_membership_defaults/columns/id/column


ALTER TABLE myapp_memberships_public.org_membership_defaults 
  DROP COLUMN id RESTRICT;


