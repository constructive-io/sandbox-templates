-- Deploy: schemas/myapp_user_identifiers_public/tables/emails/triggers/emails_is_verified_monotonic_tg
-- made with <3 @ constructive.io

-- requires: schemas/myapp_user_identifiers_public/schema
-- requires: schemas/myapp_user_identifiers_public/tables/emails/table


CREATE TRIGGER emails_is_verified_monotonic_tg
BEFORE UPDATE ON myapp_user_identifiers_public.emails
FOR EACH ROW
WHEN (OLD.is_verified IS TRUE AND NEW.is_verified IS FALSE)
EXECUTE PROCEDURE utils.throw ( 'MONOTONIC_FIELD', 'is_verified' );

