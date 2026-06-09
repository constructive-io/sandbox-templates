-- Deploy: schemas/myapp_events_public/tables/org_levels/alterations/alt0000000954
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/org_levels/table


ALTER TABLE myapp_events_public.org_levels 
  DISABLE ROW LEVEL SECURITY;

