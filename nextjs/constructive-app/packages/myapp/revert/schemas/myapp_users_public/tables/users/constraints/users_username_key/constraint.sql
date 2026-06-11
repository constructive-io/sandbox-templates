-- Revert: schemas/myapp_users_public/tables/users/constraints/users_username_key/constraint


ALTER TABLE myapp_users_public.users 
  DROP CONSTRAINT users_username_key;


