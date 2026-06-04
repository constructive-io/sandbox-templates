-- Deploy: schemas/myapp_memberships_public/tables/membership_types/columns/name/alterations/alt0000000018
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/membership_types/table
-- requires: schemas/myapp_memberships_public/tables/membership_types/columns/name/column


ALTER TABLE myapp_memberships_public.membership_types 
  ALTER COLUMN name SET NOT NULL;

