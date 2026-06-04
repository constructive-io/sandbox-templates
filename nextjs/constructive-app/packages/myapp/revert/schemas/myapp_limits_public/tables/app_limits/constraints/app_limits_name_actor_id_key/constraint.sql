-- Revert: schemas/myapp_limits_public/tables/app_limits/constraints/app_limits_name_actor_id_key/constraint


ALTER TABLE myapp_limits_public.app_limits 
  DROP CONSTRAINT app_limits_name_actor_id_key;


