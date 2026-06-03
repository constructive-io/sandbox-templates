-- Revert: schemas/myapp_memberships_public/tables/app_memberships/columns/updated_at/alterations/alt0000000186


ALTER TABLE myapp_memberships_public.app_memberships 
  ALTER COLUMN updated_at DROP DEFAULT;


