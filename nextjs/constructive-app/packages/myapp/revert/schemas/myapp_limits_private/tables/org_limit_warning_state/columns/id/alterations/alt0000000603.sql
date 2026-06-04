-- Revert: schemas/myapp_limits_private/tables/org_limit_warning_state/columns/id/alterations/alt0000000603


ALTER TABLE myapp_limits_private.org_limit_warning_state 
  ALTER COLUMN id DROP NOT NULL;


