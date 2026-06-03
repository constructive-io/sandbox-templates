-- Revert: schemas/myapp_memberships_public/tables/app_memberships/columns/actor_id/column


ALTER TABLE myapp_memberships_public.app_memberships 
  DROP COLUMN actor_id RESTRICT;


