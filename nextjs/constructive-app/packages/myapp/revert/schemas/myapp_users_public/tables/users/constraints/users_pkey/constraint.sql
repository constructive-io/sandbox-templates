-- Revert: schemas/myapp_users_public/tables/users/constraints/users_pkey/constraint


ALTER TABLE myapp_users_public.users 
  DROP CONSTRAINT users_pkey;


