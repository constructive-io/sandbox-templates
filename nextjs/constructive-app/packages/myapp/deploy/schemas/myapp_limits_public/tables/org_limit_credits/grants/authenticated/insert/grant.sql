-- Deploy: schemas/myapp_limits_public/tables/org_limit_credits/grants/authenticated/insert/grant
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/org_limit_credits/table


GRANT INSERT ON myapp_limits_public.org_limit_credits TO authenticated;

