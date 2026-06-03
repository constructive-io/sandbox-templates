-- Deploy: schemas/myapp_events_public/tables/app_level_grants/triggers/timestamps_tg
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/app_level_grants/table


CREATE TRIGGER timestamps_tg
BEFORE INSERT OR UPDATE ON myapp_events_public.app_level_grants
FOR EACH ROW
EXECUTE PROCEDURE stamps.timestamps ( );

