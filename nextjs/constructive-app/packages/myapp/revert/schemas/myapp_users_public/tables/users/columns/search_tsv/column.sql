-- Revert: schemas/myapp_users_public/tables/users/columns/search_tsv/column


ALTER TABLE myapp_users_public.users 
  DROP COLUMN search_tsv RESTRICT;


