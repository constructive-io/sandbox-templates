-- Deploy: schemas/myapp_limits_public/tables/app_limits/grants/authenticated/select/grant
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/app_limits/table


GRANT SELECT ON myapp_limits_public.app_limits TO authenticated;

