-- Deploy: schemas/myapp_events_public/tables/app_levels/triggers/timestamps_tg
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/app_levels/table


CREATE TRIGGER timestamps_tg
BEFORE INSERT OR UPDATE ON myapp_events_public.app_levels
FOR EACH ROW
EXECUTE PROCEDURE stamps.timestamps ( );

