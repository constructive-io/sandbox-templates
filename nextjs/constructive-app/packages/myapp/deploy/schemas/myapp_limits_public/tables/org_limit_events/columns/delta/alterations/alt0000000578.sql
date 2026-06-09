-- Deploy: schemas/myapp_limits_public/tables/org_limit_events/columns/delta/alterations/alt0000000578
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/org_limit_events/columns/delta/column


COMMENT ON COLUMN myapp_limits_public.org_limit_events.delta IS E'Change amount: positive for increment, negative for decrement';

