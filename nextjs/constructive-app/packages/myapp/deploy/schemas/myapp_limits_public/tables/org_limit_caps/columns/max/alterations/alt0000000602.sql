-- Deploy: schemas/myapp_limits_public/tables/org_limit_caps/columns/max/alterations/alt0000000602
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/org_limit_caps/columns/max/column


COMMENT ON COLUMN myapp_limits_public.org_limit_caps.max IS 'Override cap value for this entity';

