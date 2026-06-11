-- Deploy: schemas/myapp_users_public/tables/users/columns/display_name/column
-- made with <3 @ constructive.io

-- requires: schemas/myapp_users_public/schema
-- requires: schemas/myapp_users_public/tables/users/table


ALTER TABLE myapp_users_public.users 
  ADD COLUMN display_name text;

