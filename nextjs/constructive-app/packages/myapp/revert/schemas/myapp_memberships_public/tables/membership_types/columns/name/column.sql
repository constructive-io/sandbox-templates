-- Revert: schemas/myapp_memberships_public/tables/membership_types/columns/name/column


ALTER TABLE myapp_memberships_public.membership_types 
  DROP COLUMN name RESTRICT;


