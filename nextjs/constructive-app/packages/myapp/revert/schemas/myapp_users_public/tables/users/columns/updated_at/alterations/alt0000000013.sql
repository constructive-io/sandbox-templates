-- Revert: schemas/myapp_users_public/tables/users/columns/updated_at/alterations/alt0000000013


ALTER TABLE myapp_users_public.users 
  ALTER COLUMN updated_at DROP DEFAULT;


