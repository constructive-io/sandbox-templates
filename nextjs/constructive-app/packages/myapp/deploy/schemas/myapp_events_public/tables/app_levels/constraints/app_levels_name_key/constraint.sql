-- Deploy: schemas/myapp_events_public/tables/app_levels/constraints/app_levels_name_key/constraint
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/app_levels/table


ALTER TABLE myapp_events_public.app_levels 
  ADD CONSTRAINT app_levels_name_key 
    UNIQUE (name);

