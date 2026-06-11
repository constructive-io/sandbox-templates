-- Verify: schemas/myapp_users_public/tables/users/indexes/users_search_tsv_gin_idx


SELECT verify_index('myapp_users_public.users', 'users_search_tsv_gin_idx');


