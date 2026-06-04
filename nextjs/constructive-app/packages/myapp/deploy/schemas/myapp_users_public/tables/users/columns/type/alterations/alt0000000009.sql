-- Deploy: schemas/myapp_users_public/tables/users/columns/type/alterations/alt0000000009
-- made with <3 @ constructive.io

-- requires: schemas/myapp_users_public/schema
-- requires: schemas/myapp_users_public/tables/users/table
-- requires: schemas/myapp_users_public/tables/users/columns/type/column


ALTER TABLE myapp_users_public.users 
  ALTER COLUMN type SET NOT NULL;

