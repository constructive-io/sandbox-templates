-- Deploy: schemas/myapp_limits_public/tables/org_limits/columns/num/alterations/alt0000000507
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/org_limits/columns/num/column


COMMENT ON COLUMN myapp_limits_public.org_limits.num IS 'Current usage count for this actor and limit';

