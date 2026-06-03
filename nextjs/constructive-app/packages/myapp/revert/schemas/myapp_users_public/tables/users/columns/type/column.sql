-- Revert: schemas/myapp_users_public/tables/users/columns/type/column


ALTER TABLE myapp_users_public.users 
  DROP COLUMN type RESTRICT;


