-- Revert: schemas/myapp_memberships_public/tables/membership_types/columns/scope/column


ALTER TABLE myapp_memberships_public.membership_types 
  DROP COLUMN scope RESTRICT;


