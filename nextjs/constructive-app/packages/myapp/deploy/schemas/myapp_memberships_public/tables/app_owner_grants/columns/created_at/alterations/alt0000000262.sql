-- Deploy: schemas/myapp_memberships_public/tables/app_owner_grants/columns/created_at/alterations/alt0000000262
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/app_owner_grants/table
-- requires: schemas/myapp_memberships_public/tables/app_owner_grants/columns/created_at/column


ALTER TABLE myapp_memberships_public.app_owner_grants 
  ALTER COLUMN created_at SET DEFAULT now();

