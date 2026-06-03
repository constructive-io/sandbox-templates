-- Deploy: schemas/myapp_limits_public/tables/app_limit_warnings/alterations/alt0000000160
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/app_limit_warnings/table


COMMENT ON TABLE myapp_limits_public.app_limit_warnings IS E'Warning configuration for soft limits. Each row defines a warning threshold and the job task to enqueue when usage approaches it.';

