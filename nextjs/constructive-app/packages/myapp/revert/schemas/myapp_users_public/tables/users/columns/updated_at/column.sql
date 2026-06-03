-- Revert: schemas/myapp_users_public/tables/users/columns/updated_at/column


ALTER TABLE myapp_users_public.users 
  DROP COLUMN updated_at RESTRICT;


