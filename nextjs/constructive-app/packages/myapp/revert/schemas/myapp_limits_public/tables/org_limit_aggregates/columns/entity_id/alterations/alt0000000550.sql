-- Revert: schemas/myapp_limits_public/tables/org_limit_aggregates/columns/entity_id/alterations/alt0000000550


ALTER TABLE myapp_limits_public.org_limit_aggregates 
  ALTER COLUMN entity_id DROP NOT NULL;


