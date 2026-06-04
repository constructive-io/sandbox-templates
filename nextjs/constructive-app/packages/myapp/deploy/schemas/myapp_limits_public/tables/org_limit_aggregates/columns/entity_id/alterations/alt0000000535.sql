-- Deploy: schemas/myapp_limits_public/tables/org_limit_aggregates/columns/entity_id/alterations/alt0000000535
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/org_limit_aggregates/table
-- requires: schemas/myapp_limits_public/tables/org_limit_aggregates/columns/entity_id/column


ALTER TABLE myapp_limits_public.org_limit_aggregates 
  ALTER COLUMN entity_id SET NOT NULL;

