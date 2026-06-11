-- Deploy: schemas/myapp_limits_public/tables/org_limits/columns/entity_id/alterations/alt0000000518
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/org_limits/table
-- requires: schemas/myapp_limits_public/tables/org_limits/columns/entity_id/column


ALTER TABLE myapp_limits_public.org_limits 
  ALTER COLUMN entity_id SET NOT NULL;

