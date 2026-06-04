-- Deploy: schemas/myapp_users_public/tables/users/indexes/users_search_tsv_gin_idx
-- made with <3 @ constructive.io

-- requires: schemas/myapp_users_public/schema
-- requires: schemas/myapp_users_public/tables/users/table
-- requires: schemas/myapp_users_public/tables/users/columns/search_tsv/column


CREATE INDEX users_search_tsv_gin_idx ON myapp_users_public.users USING GIN ( search_tsv );

