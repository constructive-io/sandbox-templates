-- Deploy: schemas/myapp_limits_public/tables/app_limit_caps/columns/max/alterations/alt0000000158
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/app_limit_caps/columns/max/column


COMMENT ON COLUMN myapp_limits_public.app_limit_caps.max IS 'Override cap value for this entity';

