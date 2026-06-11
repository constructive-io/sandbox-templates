-- Deploy: schemas/myapp_users_public/tables/users/columns/id/alterations/alt0000000002
-- made with <3 @ constructive.io

-- requires: schemas/myapp_users_public/schema
-- requires: schemas/myapp_users_public/tables/users/table
-- requires: schemas/myapp_users_public/tables/users/columns/id/column


ALTER TABLE myapp_users_public.users 
  ALTER COLUMN id SET NOT NULL;

