-- Deploy: schemas/myapp_limits_public/tables/app_limit_caps/grants/authenticated/update/grant
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/app_limit_caps/table


GRANT UPDATE ON myapp_limits_public.app_limit_caps TO authenticated;

