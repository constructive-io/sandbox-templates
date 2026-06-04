-- Deploy: schemas/myapp_limits_public/tables/app_limits/grants/authenticated/insert/grant
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/app_limits/table


GRANT INSERT ON myapp_limits_public.app_limits TO authenticated;

