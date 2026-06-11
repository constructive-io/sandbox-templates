-- Revert: schemas/myapp_memberships_public/tables/org_membership_settings/columns/created_at/column


ALTER TABLE myapp_memberships_public.org_membership_settings 
  DROP COLUMN created_at RESTRICT;


