-- Revert: schemas/myapp_memberships_public/tables/org_membership_settings/columns/id/column


ALTER TABLE myapp_memberships_public.org_membership_settings 
  DROP COLUMN id RESTRICT;


