-- Revert: schemas/myapp_memberships_public/tables/org_membership_defaults/columns/is_approved/alterations/alt0000000643


ALTER TABLE myapp_memberships_public.org_membership_defaults 
  ALTER COLUMN is_approved DROP DEFAULT;


