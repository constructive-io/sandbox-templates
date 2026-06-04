-- Deploy: schemas/myapp_events_public/tables/app_level_grants/alterations/alt0000000361
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/app_level_grants/table


COMMENT ON TABLE myapp_events_public.app_level_grants IS E'Records when a user achieves a level; prevents duplicate reward grants';

