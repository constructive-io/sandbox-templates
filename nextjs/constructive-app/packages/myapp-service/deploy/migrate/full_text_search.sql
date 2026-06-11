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
  langs,
  lang_column,
  created_at,
  updated_at
) VALUES
  ('019eaaf4-aa3b-7922-8bb2-8e3fcedb5d1d', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-aa0c-7194-9321-949d0e7e42bc', '019eaaf4-aa39-780f-8e67-fade97f5f563', '{019eaaf4-aa25-70e4-a524-329edc21e274,019eaaf4-aa2f-7b68-ba8e-0188e22cde39}', '{A,B}', '{pg_catalog.simple,pg_catalog.simple}', NULL, '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z');


SET session_replication_role TO DEFAULT;


