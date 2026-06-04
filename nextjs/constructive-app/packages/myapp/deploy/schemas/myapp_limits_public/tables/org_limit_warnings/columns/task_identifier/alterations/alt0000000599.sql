-- Deploy: schemas/myapp_limits_public/tables/org_limit_warnings/columns/task_identifier/alterations/alt0000000599
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/org_limit_warnings/columns/task_identifier/column


COMMENT ON COLUMN myapp_limits_public.org_limit_warnings.task_identifier IS E'Job task name to enqueue when warning fires (e.g. email:limit_warning, notification:approaching_limit)';

