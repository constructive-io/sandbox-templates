-- Revert: schemas/myapp_memberships_public/tables/app_grants/columns/actor_id/column


ALTER TABLE myapp_memberships_public.app_grants 
  DROP COLUMN actor_id RESTRICT;


