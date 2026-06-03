-- Deploy: migrate/full_text_search
-- made with <3 @ constructive.io

-- requires: migrate/check_constraint


SET session_replication_role TO replica;
-- using replica in case we are deploying triggers to metaschema_public

-- unaccent, postgis affected and require grants
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public to public;

DO $LQLMIGRATION$
  DECLARE
  BEGIN

    EXECUTE format('GRANT CONNECT ON DATABASE %I TO %I', current_database(), 'app_user');
    EXECUTE format('GRANT CONNECT ON DATABASE %I TO %I', current_database(), 'app_admin');

  END;
$LQLMIGRATION$;

INSERT INTO metaschema_public.full_text_search (
  id,
  database_id,
  table_id,
  field_id,
  field_ids,
  weights,
  langs
) VALUES
  ('019e8c61-4a56-762e-8a88-ff4ee4839dc9', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4a23-7673-9b91-1910c9553eea', '019e8c61-4a54-74e2-ad34-4cb5470035c8', '{019e8c61-4a3f-7dee-9a11-4493f059432d,019e8c61-4a4a-7721-a1ef-ef01ae872c87}', '{A,B}', '{pg_catalog.simple,pg_catalog.simple}');


SET session_replication_role TO DEFAULT;


