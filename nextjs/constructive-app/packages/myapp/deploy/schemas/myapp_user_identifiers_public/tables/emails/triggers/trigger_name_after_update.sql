-- Deploy: schemas/myapp_user_identifiers_public/tables/emails/triggers/trigger_name_after_update
-- made with <3 @ constructive.io

-- requires: schemas/myapp_user_identifiers_public/schema
-- requires: schemas/myapp_user_identifiers_private/schema
-- requires: schemas/myapp_user_identifiers_public/tables/emails/table
-- requires: schemas/myapp_user_identifiers_private/trigger_fns/emails_insert_tg_ensure_primary


CREATE TRIGGER trigger_name_after_update
AFTER UPDATE ON myapp_user_identifiers_public.emails
FOR EACH ROW
WHEN (OLD.is_primary IS DISTINCT FROM NEW.is_primary)
EXECUTE PROCEDURE myapp_user_identifiers_private.emails_insert_tg_ensure_primary ( );

