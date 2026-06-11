-- Deploy: schemas/myapp_limits_public/tables/org_limit_aggregates/grants/authenticated/select/grant
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/org_limit_aggregates/table


GRANT SELECT ON myapp_limits_public.org_limit_aggregates TO authenticated;

