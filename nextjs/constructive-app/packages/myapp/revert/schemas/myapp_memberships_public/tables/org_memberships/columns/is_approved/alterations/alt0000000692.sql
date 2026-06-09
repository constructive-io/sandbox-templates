-- Revert: schemas/myapp_memberships_public/tables/org_memberships/columns/is_approved/alterations/alt0000000692


ALTER TABLE myapp_memberships_public.org_memberships 
  ALTER COLUMN is_approved DROP DEFAULT;


