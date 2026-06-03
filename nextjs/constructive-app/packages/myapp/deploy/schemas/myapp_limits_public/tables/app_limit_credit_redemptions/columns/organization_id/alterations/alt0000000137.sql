-- Deploy: schemas/myapp_limits_public/tables/app_limit_credit_redemptions/columns/organization_id/alterations/alt0000000137
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/app_limit_credit_redemptions/columns/organization_id/column


COMMENT ON COLUMN myapp_limits_public.app_limit_credit_redemptions.organization_id IS E'Resolved billable organization via get_organization_id';

