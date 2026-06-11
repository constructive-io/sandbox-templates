-- Deploy: schemas/myapp_events_public/tables/app_level_requirements/policies/auth_sel_all_all/policy
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/app_level_requirements/table
-- requires: schemas/myapp_events_public/tables/app_level_requirements/policies/enable_row_level_security


CREATE POLICY auth_sel_all_all ON myapp_events_public.app_level_requirements
FOR SELECT
TO authenticated
USING (
  TRUE
);

