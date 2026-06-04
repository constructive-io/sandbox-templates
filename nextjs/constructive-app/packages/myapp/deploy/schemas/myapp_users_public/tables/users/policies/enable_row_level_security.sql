-- Deploy: schemas/myapp_users_public/tables/users/policies/enable_row_level_security
-- made with <3 @ constructive.io

-- requires: schemas/myapp_users_public/schema
-- requires: schemas/myapp_users_public/tables/users/table


ALTER TABLE myapp_users_public.users 
  ENABLE ROW LEVEL SECURITY;

