-- Deploy: schemas/myapp_limits_public/tables/org_limits/grants/authenticated/delete/grant
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/org_limits/table


GRANT DELETE ON myapp_limits_public.org_limits TO authenticated;

