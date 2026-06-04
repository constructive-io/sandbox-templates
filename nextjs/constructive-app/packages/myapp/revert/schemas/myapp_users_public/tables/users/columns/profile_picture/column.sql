-- Revert: schemas/myapp_users_public/tables/users/columns/profile_picture/column


ALTER TABLE myapp_users_public.users 
  DROP COLUMN profile_picture RESTRICT;


