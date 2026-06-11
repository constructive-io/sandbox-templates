-- Deploy: schemas/myapp_limits_public/tables/app_limits/columns/entity_type/alterations/alt0000000067
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/app_limits/columns/entity_type/column


COMMENT ON COLUMN myapp_limits_public.app_limits.entity_type IS E'Entity type prefix (org, team, app, etc.) for interpreting entity_id';

