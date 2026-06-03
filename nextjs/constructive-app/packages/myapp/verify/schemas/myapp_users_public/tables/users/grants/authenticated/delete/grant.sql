-- Verify: schemas/myapp_users_public/tables/users/grants/authenticated/delete/grant


SELECT verify_table_grant('myapp_users_public.users', 'delete', 'authenticated');


