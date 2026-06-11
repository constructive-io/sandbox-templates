-- Revert: schemas/myapp_memberships_public/tables/app_memberships/columns/id/alterations/alt0000000183


ALTER TABLE myapp_memberships_public.app_memberships 
  ALTER COLUMN id DROP NOT NULL;


