-- Deploy: schemas/myapp_limits_public/tables/org_limit_events/grants/authenticated/select/grant
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/org_limit_events/table


GRANT SELECT ON myapp_limits_public.org_limit_events TO authenticated;

