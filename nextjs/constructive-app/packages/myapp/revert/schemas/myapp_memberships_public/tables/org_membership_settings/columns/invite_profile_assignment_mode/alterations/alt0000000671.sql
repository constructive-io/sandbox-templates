-- Revert: schemas/myapp_memberships_public/tables/org_membership_settings/columns/invite_profile_assignment_mode/alterations/alt0000000671


ALTER TABLE myapp_memberships_public.org_membership_settings 
  ALTER COLUMN invite_profile_assignment_mode DROP DEFAULT;


