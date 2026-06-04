-- Revert: schemas/myapp_memberships_public/tables/app_memberships/columns/is_disabled/alterations/alt0000000220


ALTER TABLE myapp_memberships_public.app_memberships 
  ALTER COLUMN is_disabled DROP DEFAULT;


