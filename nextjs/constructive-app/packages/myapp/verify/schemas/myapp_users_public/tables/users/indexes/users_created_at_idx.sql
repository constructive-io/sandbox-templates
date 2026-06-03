-- Verify: schemas/myapp_users_public/tables/users/indexes/users_created_at_idx


SELECT verify_index('myapp_users_public.users', 'users_created_at_idx');


