-- Deploy: schemas/myapp_memberships_public/tables/app_memberships/columns/updated_at/alterations/alt0000000186
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/app_memberships/table
-- requires: schemas/myapp_memberships_public/tables/app_memberships/columns/updated_at/column


ALTER TABLE myapp_memberships_public.app_memberships 
  ALTER COLUMN updated_at SET DEFAULT now();

