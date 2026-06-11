-- Revert: schemas/myapp_memberships_public/tables/app_memberships/columns/actor_id/alterations/alt0000000240


ALTER TABLE myapp_memberships_public.app_memberships 
  ALTER COLUMN actor_id DROP NOT NULL;


