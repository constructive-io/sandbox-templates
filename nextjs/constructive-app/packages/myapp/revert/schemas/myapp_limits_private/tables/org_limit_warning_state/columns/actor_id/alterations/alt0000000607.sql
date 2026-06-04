-- Revert: schemas/myapp_limits_private/tables/org_limit_warning_state/columns/actor_id/alterations/alt0000000607


ALTER TABLE myapp_limits_private.org_limit_warning_state 
  ALTER COLUMN actor_id DROP NOT NULL;


