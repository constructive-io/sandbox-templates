-- Deploy: schemas/myapp_store_private/procedures/user_state_del/procedure/alterations/alt0000001039
-- made with <3 @ constructive.io

-- requires: schemas/myapp_store_private/schema
-- requires: schemas/myapp_store_private/tables/user_state/table


CREATE FUNCTION myapp_store_private.user_state_del(
  IN owner_id uuid,
  IN secret_names text[]
) RETURNS void AS $_PGFN_$
BEGIN
  DELETE FROM myapp_store_private.user_state AS s
  WHERE
    s.owner_id = user_state_del.owner_id AND s.name = ANY( user_state_del.secret_names );
END;
$_PGFN_$ LANGUAGE plpgsql VOLATILE;

