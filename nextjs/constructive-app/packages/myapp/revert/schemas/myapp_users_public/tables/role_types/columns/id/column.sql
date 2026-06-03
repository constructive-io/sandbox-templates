-- Revert: schemas/myapp_users_public/tables/role_types/columns/id/column


ALTER TABLE myapp_users_public.role_types 
  DROP COLUMN id RESTRICT;


