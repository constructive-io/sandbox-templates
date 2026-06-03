-- Revert: schemas/myapp_memberships_public/tables/app_grants/columns/actor_id/alterations/alt0000000276


ALTER TABLE myapp_memberships_public.app_grants 
  ALTER COLUMN actor_id DROP NOT NULL;


