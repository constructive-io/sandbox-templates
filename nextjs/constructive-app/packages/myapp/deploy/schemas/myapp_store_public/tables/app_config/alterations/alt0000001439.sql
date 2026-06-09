-- Deploy: schemas/myapp_store_public/tables/app_config/alterations/alt0000001439
-- made with <3 @ constructive.io

-- requires: schemas/myapp_store_public/schema
-- requires: schemas/myapp_store_public/tables/app_config/table


ALTER TABLE myapp_store_public.app_config 
  DISABLE ROW LEVEL SECURITY;

