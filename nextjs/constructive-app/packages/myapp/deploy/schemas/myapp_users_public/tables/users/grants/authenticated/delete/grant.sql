-- Deploy: schemas/myapp_users_public/tables/users/grants/authenticated/delete/grant
-- made with <3 @ constructive.io

-- requires: schemas/myapp_users_public/schema
-- requires: schemas/myapp_users_public/tables/users/table


GRANT DELETE ON myapp_users_public.users TO authenticated;

