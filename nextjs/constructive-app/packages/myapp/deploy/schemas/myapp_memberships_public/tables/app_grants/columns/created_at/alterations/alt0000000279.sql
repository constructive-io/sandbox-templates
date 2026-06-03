-- Deploy: schemas/myapp_memberships_public/tables/app_grants/columns/created_at/alterations/alt0000000279
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/app_grants/table
-- requires: schemas/myapp_memberships_public/tables/app_grants/columns/created_at/column


ALTER TABLE myapp_memberships_public.app_grants 
  ALTER COLUMN created_at SET DEFAULT now();

