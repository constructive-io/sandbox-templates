-- Revert: schemas/myapp_limits_private/tables/org_limit_warning_state/columns/warned_at/alterations/alt0000000624


ALTER TABLE myapp_limits_private.org_limit_warning_state 
  ALTER COLUMN warned_at DROP NOT NULL;


