-- Revert: schemas/myapp_users_public/tables/users/columns/type/alterations/alt0000000009


ALTER TABLE myapp_users_public.users 
  ALTER COLUMN type DROP NOT NULL;


