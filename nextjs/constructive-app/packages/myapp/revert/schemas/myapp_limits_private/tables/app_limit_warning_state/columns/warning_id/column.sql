-- Revert: schemas/myapp_limits_private/tables/app_limit_warning_state/columns/warning_id/column


ALTER TABLE myapp_limits_private.app_limit_warning_state 
  DROP COLUMN warning_id RESTRICT;


