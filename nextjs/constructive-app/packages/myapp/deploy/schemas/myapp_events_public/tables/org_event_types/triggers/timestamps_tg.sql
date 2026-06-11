-- Deploy: schemas/myapp_events_public/tables/org_event_types/triggers/timestamps_tg
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/org_event_types/table


CREATE TRIGGER timestamps_tg
BEFORE INSERT OR UPDATE ON myapp_events_public.org_event_types
FOR EACH ROW
EXECUTE PROCEDURE stamps.timestamps ( );

