-- Revert: schemas/myapp_users_public/tables/users/grants/authenticated/insert/grant


REVOKE INSERT (type, display_name, profile_picture, username) ON myapp_users_public.users FROM authenticated;


