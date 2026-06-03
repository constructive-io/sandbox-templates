-- Revert: schemas/myapp_limits_public/tables/app_limits/columns/actor_id/alterations/alt0000000053


ALTER TABLE myapp_limits_public.app_limits 
  ALTER COLUMN actor_id DROP NOT NULL;


