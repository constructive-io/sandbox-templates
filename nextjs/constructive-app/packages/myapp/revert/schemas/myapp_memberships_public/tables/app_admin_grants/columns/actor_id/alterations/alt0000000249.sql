-- Revert: schemas/myapp_memberships_public/tables/app_admin_grants/columns/actor_id/alterations/alt0000000249


ALTER TABLE myapp_memberships_public.app_admin_grants 
  ALTER COLUMN actor_id DROP NOT NULL;


