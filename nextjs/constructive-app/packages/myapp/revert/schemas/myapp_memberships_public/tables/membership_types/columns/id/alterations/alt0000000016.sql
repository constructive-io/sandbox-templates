-- Revert: schemas/myapp_memberships_public/tables/membership_types/columns/id/alterations/alt0000000016


ALTER TABLE myapp_memberships_public.membership_types 
  ALTER COLUMN id DROP NOT NULL;


