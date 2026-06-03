-- Deploy: schemas/myapp_limits_public/tables/app_limit_events/alterations/alt0000000090
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/app_limit_events/table


COMMENT ON TABLE myapp_limits_public.app_limit_events IS E'Append-only log of limit events for historical reporting and audit';

