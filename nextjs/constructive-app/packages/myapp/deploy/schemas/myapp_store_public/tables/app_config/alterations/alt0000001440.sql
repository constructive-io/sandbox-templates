-- Deploy: schemas/myapp_store_public/tables/app_config/alterations/alt0000001440
-- made with <3 @ constructive.io

-- requires: schemas/myapp_store_public/schema
-- requires: schemas/myapp_store_public/tables/app_config/table


COMMENT ON TABLE myapp_store_public.app_config IS E'App-level plaintext key-value config store (like a k8s ConfigMap); admin-only, fully CRUD-exposed';

