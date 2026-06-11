-- Deploy: schemas/myapp_limits_public/tables/app_limit_defaults/grants/authenticated/update/grant
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/app_limit_defaults/table


GRANT UPDATE ON myapp_limits_public.app_limit_defaults TO authenticated;

