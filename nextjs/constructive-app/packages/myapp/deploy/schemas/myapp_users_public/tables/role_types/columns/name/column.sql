-- Deploy: schemas/myapp_users_public/tables/role_types/columns/name/column
-- made with <3 @ constructive.io

-- requires: schemas/myapp_users_public/schema
-- requires: schemas/myapp_users_public/tables/role_types/table


ALTER TABLE myapp_users_public.role_types 
  ADD COLUMN name citext;

