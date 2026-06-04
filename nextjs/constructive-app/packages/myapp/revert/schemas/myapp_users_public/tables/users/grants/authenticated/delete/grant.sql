-- Revert: schemas/myapp_users_public/tables/users/grants/authenticated/delete/grant


REVOKE DELETE ON myapp_users_public.users FROM authenticated;


