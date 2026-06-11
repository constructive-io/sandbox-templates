-- Revert: schemas/myapp_memberships_public/tables/org_membership_settings/columns/updated_by/column


ALTER TABLE myapp_memberships_public.org_membership_settings 
  DROP COLUMN updated_by RESTRICT;


