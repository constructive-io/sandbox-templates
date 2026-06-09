-- Deploy: schemas/myapp_events_public/tables/app_event_types/policies/auth_sel_all_all/policy
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/app_event_types/table
-- requires: schemas/myapp_events_public/tables/app_event_types/policies/enable_row_level_security


CREATE POLICY auth_sel_all_all ON myapp_events_public.app_event_types
FOR SELECT
TO authenticated
USING (
  TRUE
);

