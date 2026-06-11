-- Deploy: schemas/myapp_limits_public/tables/app_limit_caps/grants/authenticated/insert/grant
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/app_limit_caps/table


GRANT INSERT ON myapp_limits_public.app_limit_caps TO authenticated;

