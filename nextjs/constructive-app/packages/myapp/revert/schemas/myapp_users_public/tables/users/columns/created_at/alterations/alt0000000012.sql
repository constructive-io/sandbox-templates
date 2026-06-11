-- Revert: schemas/myapp_users_public/tables/users/columns/created_at/alterations/alt0000000012


ALTER TABLE myapp_users_public.users 
  ALTER COLUMN created_at DROP DEFAULT;


