-- Revert: schemas/myapp_users_public/tables/users/columns/username/column


ALTER TABLE myapp_users_public.users 
  DROP COLUMN username RESTRICT;


