-- Deploy: schemas/myapp_limits_public/tables/app_limit_events/columns/organization_id/alterations/alt0000000097
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/app_limit_events/columns/organization_id/column


COMMENT ON COLUMN myapp_limits_public.app_limit_events.organization_id IS E'Resolved billable organization via get_organization_id; NULL for app-level events';

