-- Deploy: schemas/myapp_users_public/tables/users/grants/authenticated/select/grant
-- made with <3 @ constructive.io

-- requires: schemas/myapp_users_public/schema
-- requires: schemas/myapp_users_public/tables/users/table


GRANT SELECT ON myapp_users_public.users TO authenticated;

