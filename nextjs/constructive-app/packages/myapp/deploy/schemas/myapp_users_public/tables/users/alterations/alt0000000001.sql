-- Deploy: schemas/myapp_users_public/tables/users/alterations/alt0000000001
-- made with <3 @ constructive.io

-- requires: schemas/myapp_users_public/schema
-- requires: schemas/myapp_users_public/tables/users/table


ALTER TABLE myapp_users_public.users 
  DISABLE ROW LEVEL SECURITY;

