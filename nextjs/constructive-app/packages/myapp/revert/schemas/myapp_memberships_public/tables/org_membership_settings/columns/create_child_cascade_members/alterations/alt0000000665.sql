-- Revert: schemas/myapp_memberships_public/tables/org_membership_settings/columns/create_child_cascade_members/alterations/alt0000000665


ALTER TABLE myapp_memberships_public.org_membership_settings 
  ALTER COLUMN create_child_cascade_members DROP DEFAULT;


