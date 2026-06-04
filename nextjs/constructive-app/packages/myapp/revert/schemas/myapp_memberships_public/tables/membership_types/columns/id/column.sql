-- Revert: schemas/myapp_memberships_public/tables/membership_types/columns/id/column


ALTER TABLE myapp_memberships_public.membership_types 
  DROP COLUMN id RESTRICT;


