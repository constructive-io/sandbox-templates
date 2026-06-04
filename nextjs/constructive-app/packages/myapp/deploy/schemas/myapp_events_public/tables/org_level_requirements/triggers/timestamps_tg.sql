-- Deploy: schemas/myapp_events_public/tables/org_level_requirements/triggers/timestamps_tg
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/org_level_requirements/table


CREATE TRIGGER timestamps_tg
BEFORE INSERT OR UPDATE ON myapp_events_public.org_level_requirements
FOR EACH ROW
EXECUTE PROCEDURE stamps.timestamps ( );

