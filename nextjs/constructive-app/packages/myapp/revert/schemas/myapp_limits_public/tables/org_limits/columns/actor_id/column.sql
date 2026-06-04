-- Revert: schemas/myapp_limits_public/tables/org_limits/columns/actor_id/column


ALTER TABLE myapp_limits_public.org_limits 
  DROP COLUMN actor_id RESTRICT;


