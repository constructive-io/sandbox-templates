-- Deploy: schemas/myapp_limits_public/tables/org_limits/columns/entity_id/column
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/org_limits/table


ALTER TABLE myapp_limits_public.org_limits 
  ADD COLUMN entity_id uuid;

