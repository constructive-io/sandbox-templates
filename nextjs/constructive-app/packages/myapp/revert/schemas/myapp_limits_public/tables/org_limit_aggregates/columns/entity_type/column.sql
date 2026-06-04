-- Revert: schemas/myapp_limits_public/tables/org_limit_aggregates/columns/entity_type/column


ALTER TABLE myapp_limits_public.org_limit_aggregates 
  DROP COLUMN entity_type RESTRICT;


