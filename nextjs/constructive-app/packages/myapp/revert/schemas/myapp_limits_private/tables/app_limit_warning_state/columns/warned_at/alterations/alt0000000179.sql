-- Revert: schemas/myapp_limits_private/tables/app_limit_warning_state/columns/warned_at/alterations/alt0000000179


ALTER TABLE myapp_limits_private.app_limit_warning_state 
  ALTER COLUMN warned_at DROP NOT NULL;


