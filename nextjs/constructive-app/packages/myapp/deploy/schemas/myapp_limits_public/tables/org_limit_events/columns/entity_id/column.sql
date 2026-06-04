-- Deploy: schemas/myapp_limits_public/tables/org_limit_events/columns/entity_id/column
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/org_limit_events/table


ALTER TABLE myapp_limits_public.org_limit_events 
  ADD COLUMN entity_id uuid;

