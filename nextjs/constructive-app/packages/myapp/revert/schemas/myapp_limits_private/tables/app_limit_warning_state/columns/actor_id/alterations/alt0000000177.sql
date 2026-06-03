-- Revert: schemas/myapp_limits_private/tables/app_limit_warning_state/columns/actor_id/alterations/alt0000000177


ALTER TABLE myapp_limits_private.app_limit_warning_state 
  ALTER COLUMN actor_id DROP NOT NULL;


