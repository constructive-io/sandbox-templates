-- Deploy: schemas/myapp_memberships_public/tables/app_memberships/columns/is_banned/alterations/alt0000000216
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/app_memberships/table
-- requires: schemas/myapp_memberships_public/tables/app_memberships/columns/is_banned/column


ALTER TABLE myapp_memberships_public.app_memberships 
  ALTER COLUMN is_banned SET NOT NULL;

