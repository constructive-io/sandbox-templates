-- Revert: schemas/myapp_memberships_public/tables/org_membership_settings/columns/id/alterations/alt0000000664


ALTER TABLE myapp_memberships_public.org_membership_settings 
  ALTER COLUMN id DROP NOT NULL;


