-- Revert: schemas/myapp_limits_private/tables/org_limit_warning_state/columns/warning_id/alterations/alt0000000605


ALTER TABLE myapp_limits_private.org_limit_warning_state 
  ALTER COLUMN warning_id DROP NOT NULL;


