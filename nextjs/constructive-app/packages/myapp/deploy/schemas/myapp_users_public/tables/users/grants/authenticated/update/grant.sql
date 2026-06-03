-- Deploy: schemas/myapp_users_public/tables/users/grants/authenticated/update/grant
-- made with <3 @ constructive.io

-- requires: schemas/myapp_users_public/schema
-- requires: schemas/myapp_users_public/tables/users/table


GRANT UPDATE (username, display_name, profile_picture) ON myapp_users_public.users TO authenticated;

