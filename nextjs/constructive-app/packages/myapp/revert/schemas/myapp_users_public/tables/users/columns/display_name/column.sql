-- Revert: schemas/myapp_users_public/tables/users/columns/display_name/column


ALTER TABLE myapp_users_public.users 
  DROP COLUMN display_name RESTRICT;


