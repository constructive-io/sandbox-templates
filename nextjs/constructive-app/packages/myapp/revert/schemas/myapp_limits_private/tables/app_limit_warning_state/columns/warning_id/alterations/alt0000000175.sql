-- Revert: schemas/myapp_limits_private/tables/app_limit_warning_state/columns/warning_id/alterations/alt0000000175


ALTER TABLE myapp_limits_private.app_limit_warning_state 
  ALTER COLUMN warning_id DROP NOT NULL;


