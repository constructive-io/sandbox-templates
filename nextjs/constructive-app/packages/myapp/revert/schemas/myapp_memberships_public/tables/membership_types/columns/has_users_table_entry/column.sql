-- Revert: schemas/myapp_memberships_public/tables/membership_types/columns/has_users_table_entry/column


ALTER TABLE myapp_memberships_public.membership_types 
  DROP COLUMN has_users_table_entry RESTRICT;


