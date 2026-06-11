-- Revert: schemas/myapp_limits_private/tables/org_limit_warning_state/columns/entity_id/column


ALTER TABLE myapp_limits_private.org_limit_warning_state 
  DROP COLUMN entity_id RESTRICT;


