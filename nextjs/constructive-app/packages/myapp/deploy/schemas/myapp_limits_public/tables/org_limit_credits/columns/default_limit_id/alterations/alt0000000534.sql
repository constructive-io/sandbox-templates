-- Deploy: schemas/myapp_limits_public/tables/org_limit_credits/columns/default_limit_id/alterations/alt0000000534
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/org_limit_credits/columns/default_limit_id/column


COMMENT ON COLUMN myapp_limits_public.org_limit_credits.default_limit_id IS E'FK to default_limits — which limit definition this credit applies to';

