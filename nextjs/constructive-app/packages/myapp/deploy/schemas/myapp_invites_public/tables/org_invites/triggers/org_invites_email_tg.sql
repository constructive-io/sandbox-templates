-- Deploy: schemas/myapp_invites_public/tables/org_invites/triggers/org_invites_email_tg
-- made with <3 @ constructive.io

-- requires: schemas/myapp_invites_public/schema
-- requires: schemas/myapp_invites_private/schema
-- requires: schemas/myapp_invites_public/tables/org_invites/table
-- requires: schemas/myapp_invites_private/trigger_fns/org_invites_insert_before_tg


CREATE TRIGGER org_invites_email_tg
BEFORE INSERT ON myapp_invites_public.org_invites
FOR EACH ROW
EXECUTE PROCEDURE myapp_invites_private.org_invites_insert_before_tg ( );

