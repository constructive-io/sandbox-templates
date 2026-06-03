-- Revert: schemas/myapp_users_public/tables/users/columns/created_at/column


ALTER TABLE myapp_users_public.users 
  DROP COLUMN created_at RESTRICT;


