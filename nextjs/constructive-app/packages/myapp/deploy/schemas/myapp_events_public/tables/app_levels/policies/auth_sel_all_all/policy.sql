-- Deploy: schemas/myapp_events_public/tables/app_levels/policies/auth_sel_all_all/policy
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/app_levels/table


CREATE POLICY auth_sel_all_all ON myapp_events_public.app_levels
FOR SELECT
TO authenticated
USING (
  TRUE
);

