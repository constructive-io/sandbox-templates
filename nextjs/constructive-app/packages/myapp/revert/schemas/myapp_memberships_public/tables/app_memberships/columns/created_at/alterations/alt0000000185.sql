-- Revert: schemas/myapp_memberships_public/tables/app_memberships/columns/created_at/alterations/alt0000000185


ALTER TABLE myapp_memberships_public.app_memberships 
  ALTER COLUMN created_at DROP DEFAULT;


