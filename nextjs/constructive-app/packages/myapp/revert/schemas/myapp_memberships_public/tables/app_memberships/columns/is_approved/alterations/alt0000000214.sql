-- Revert: schemas/myapp_memberships_public/tables/app_memberships/columns/is_approved/alterations/alt0000000214


ALTER TABLE myapp_memberships_public.app_memberships 
  ALTER COLUMN is_approved DROP DEFAULT;


