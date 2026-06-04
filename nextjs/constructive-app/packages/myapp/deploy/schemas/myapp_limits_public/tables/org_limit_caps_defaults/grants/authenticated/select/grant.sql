-- Deploy: schemas/myapp_limits_public/tables/org_limit_caps_defaults/grants/authenticated/select/grant
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/org_limit_caps_defaults/table


GRANT SELECT ON myapp_limits_public.org_limit_caps_defaults TO authenticated;

