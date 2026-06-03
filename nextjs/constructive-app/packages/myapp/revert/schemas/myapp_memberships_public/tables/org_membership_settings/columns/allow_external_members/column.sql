-- Revert: schemas/myapp_memberships_public/tables/org_membership_settings/columns/allow_external_members/column


ALTER TABLE myapp_memberships_public.org_membership_settings 
  DROP COLUMN allow_external_members RESTRICT;


