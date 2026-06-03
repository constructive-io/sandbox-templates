-- Revert: schemas/myapp_users_public/tables/users/columns/id/column


ALTER TABLE myapp_users_public.users 
  DROP COLUMN id RESTRICT;


