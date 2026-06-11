-- Revert: schemas/myapp_limits_private/tables/app_limit_warning_state/columns/warned_at/column


ALTER TABLE myapp_limits_private.app_limit_warning_state 
  DROP COLUMN warned_at RESTRICT;


