-- Deploy: schemas/myapp_limits_public/tables/org_limit_defaults/grants/authenticated/delete/grant
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/org_limit_defaults/table


GRANT DELETE ON myapp_limits_public.org_limit_defaults TO authenticated;

