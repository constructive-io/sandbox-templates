-- Deploy: schemas/myapp_invites_public/tables/org_claimed_invites/triggers/timestamps_tg
-- made with <3 @ constructive.io

-- requires: schemas/myapp_invites_public/schema
-- requires: schemas/myapp_invites_public/tables/org_claimed_invites/table


CREATE TRIGGER timestamps_tg
BEFORE INSERT OR UPDATE ON myapp_invites_public.org_claimed_invites
FOR EACH ROW
EXECUTE PROCEDURE stamps.timestamps ( );

