-- Revert: schemas/myapp_users_public/tables/role_types/columns/name/alterations/alt0000000008


ALTER TABLE myapp_users_public.role_types 
  ALTER COLUMN name DROP NOT NULL;


