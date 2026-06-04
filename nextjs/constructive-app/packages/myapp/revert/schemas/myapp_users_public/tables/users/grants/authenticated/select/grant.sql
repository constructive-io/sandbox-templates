-- Revert: schemas/myapp_users_public/tables/users/grants/authenticated/select/grant


REVOKE SELECT ON myapp_users_public.users FROM authenticated;


