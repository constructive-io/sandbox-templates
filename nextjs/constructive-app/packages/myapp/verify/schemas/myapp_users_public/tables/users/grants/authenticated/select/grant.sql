-- Verify: schemas/myapp_users_public/tables/users/grants/authenticated/select/grant


SELECT verify_table_grant('myapp_users_public.users', 'select', 'authenticated');


