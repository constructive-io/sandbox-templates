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
  ('019e917c-c7a2-77ed-818b-5f67fd298cb4', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-c772-7ad9-bec4-337ce1956129', '019e917c-c7a0-782a-b09f-46975ae47cc7', '{019e917c-c78c-70ae-b71d-036e3e7248b8,019e917c-c796-7b46-9ed6-1981c20ac50a}', '{A,B}', '{pg_catalog.simple,pg_catalog.simple}');


SET session_replication_role TO DEFAULT;


