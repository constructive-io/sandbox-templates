-- Revert: schemas/myapp_users_public/tables/users/grants/authenticated/update/grant


REVOKE UPDATE (username, display_name, profile_picture) ON myapp_users_public.users FROM authenticated;


