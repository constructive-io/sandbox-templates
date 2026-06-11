-- Deploy: schemas/myapp_users_public/tables/users/triggers/users_search_tsv_tsv_insert_tg
-- made with <3 @ constructive.io

-- requires: schemas/myapp_private/schema
-- requires: schemas/myapp_users_public/schema
-- requires: schemas/myapp_users_public/tables/users/table
-- requires: schemas/myapp_private/trigger_fns/users_search_tsv_tsv


CREATE TRIGGER users_search_tsv_tsv_insert_tg
BEFORE INSERT ON myapp_users_public.users
FOR EACH ROW
EXECUTE PROCEDURE myapp_private.users_search_tsv_tsv ( );

