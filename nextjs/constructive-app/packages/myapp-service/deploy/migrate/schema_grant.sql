-- Deploy: migrate/schema_grant
-- made with <3 @ constructive.io

-- requires: migrate/full_text_search


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

INSERT INTO metaschema_public.schema_grant (
  id,
  database_id,
  schema_id,
  grantee_name,
  created_at,
  updated_at
) VALUES
  ('019eaaf4-a998-7c5d-8ea9-39ea17944c0b', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-a98c-721b-917c-d43cc6b29b01', 'administrator', '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-a99c-7b6e-b04e-e62ba47088b7', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-a98c-721b-917c-d43cc6b29b01', 'authenticated', '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-a9a0-76a3-8595-0df75eddee74', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-a98c-721b-917c-d43cc6b29b01', 'anonymous', '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-a9b4-7a91-933b-305dfe872655', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-a98c-7a02-91ff-02f38f427e28', 'administrator', '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-a9b7-7d13-bed4-63d55d8a3ec8', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-a98c-7a02-91ff-02f38f427e28', 'authenticated', '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-a9ba-7fef-9134-8c701338996c', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-a98c-7a02-91ff-02f38f427e28', 'anonymous', '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-a9cc-7c1f-8c7d-93d4810766f3', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-a9c9-7aef-b745-7f1f5cd5e610', 'administrator', '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-a9cf-7816-991c-585c68007c9f', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-a9c9-7aef-b745-7f1f5cd5e610', 'authenticated', '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-a9d2-74e5-817c-99ca739f3419', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-a9c9-7aef-b745-7f1f5cd5e610', 'anonymous', '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-a9e1-79fc-b356-edf5511d11a5', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-a9de-7ceb-8bbb-a20c7a8e0a1b', 'administrator', '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-a9e4-7401-996a-3932432a7d7c', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-a9de-7ceb-8bbb-a20c7a8e0a1b', 'authenticated', '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-a9e6-7ea0-9a7c-73250c11d8a7', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-a9de-7ceb-8bbb-a20c7a8e0a1b', 'anonymous', '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-a9f9-7fda-a318-780e195bc15f', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-a9f7-72b6-9a15-44faf2e40170', 'administrator', '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-a9fc-7804-80f5-c0d0bc869df3', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-a9f7-72b6-9a15-44faf2e40170', 'authenticated', '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-a9ff-7895-ac16-029fef22db8c', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-a9f7-72b6-9a15-44faf2e40170', 'anonymous', '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-aa8a-7ce2-ae17-c6ae081472e6', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-aa88-7de6-b751-72f64d8bcc50', 'administrator', '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-aa8d-7824-bac7-2a759430fdf5', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-aa88-7de6-b751-72f64d8bcc50', 'authenticated', '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-aa90-72c5-b0d8-39780d85f353', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-aa88-7de6-b751-72f64d8bcc50', 'anonymous', '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-aadd-7936-8a42-777dbd4ea188', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-aadb-778f-902a-91e751731d94', 'administrator', '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-aae0-789a-8ee4-6e750ef171a4', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-aadb-778f-902a-91e751731d94', 'authenticated', '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-aae3-77fb-86fb-84e372788e2e', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-aadb-778f-902a-91e751731d94', 'anonymous', '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-aaf5-769a-9ac5-32f08893df1b', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-aaf2-7540-a35a-612afc331b3d', 'administrator', '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-aaf8-7351-b21e-254f3ee51d3c', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-aaf2-7540-a35a-612afc331b3d', 'authenticated', '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-aafb-717f-876d-fbcd0b73bc20', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-aaf2-7540-a35a-612afc331b3d', 'anonymous', '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-ab79-720c-8929-d0740879a1b9', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-ab77-7082-874b-03ac48ee0667', 'administrator', '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-ab7b-7fd3-b322-8aa3c55318b7', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-ab77-7082-874b-03ac48ee0667', 'authenticated', '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-ab7e-7a63-baf0-0ac5871b15dd', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-ab77-7082-874b-03ac48ee0667', 'anonymous', '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-ab8f-73fb-b3a9-2778731de96f', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-ab8c-7326-b74d-76d82fad9f61', 'administrator', '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-ab91-7eb6-8fcd-dcb0b487047f', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-ab8c-7326-b74d-76d82fad9f61', 'authenticated', '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-ab94-7958-b455-0aea5dab39b1', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-ab8c-7326-b74d-76d82fad9f61', 'anonymous', '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-aed7-7ec0-ad98-50a4f766a6ac', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-aed4-7b99-9fbe-be3017bb6b7f', 'administrator', '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-aee3-7fb0-b414-2e59f3fb6161', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-aed4-7b99-9fbe-be3017bb6b7f', 'authenticated', '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-aee7-7d56-903c-62574346de94', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-aed4-7b99-9fbe-be3017bb6b7f', 'anonymous', '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-b28a-7d57-8d68-520faac65fbf', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-b287-7afd-bef4-173fcebab403', 'administrator', '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-b28f-7efd-b38b-c80e5e9b4365', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-b287-7afd-bef4-173fcebab403', 'authenticated', '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-b293-75a0-9b28-75df3cce1867', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-b287-7afd-bef4-173fcebab403', 'anonymous', '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-b2ab-745a-b79e-61bdacbd5c74', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-b2a7-7448-96b2-d23026c539d1', 'administrator', '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-b2ae-7945-9463-67f87414fe44', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-b2a7-7448-96b2-d23026c539d1', 'authenticated', '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-b2b2-765c-b889-f4c09131d997', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-b2a7-7448-96b2-d23026c539d1', 'anonymous', '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-b675-7cb2-bba8-f5e13e092617', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-b672-7241-b447-aa32328ae3e1', 'administrator', '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-b67a-73cc-ab64-3d9e6c07b379', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-b672-7241-b447-aa32328ae3e1', 'authenticated', '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-b67e-77a7-8198-a55316d5ef0b', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-b672-7241-b447-aa32328ae3e1', 'anonymous', '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-b69b-73e7-b279-679fd6676baa', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-b696-7c48-8639-7c8449be5a65', 'administrator', '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-b69e-7f50-846e-87256c4c87a6', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-b696-7c48-8639-7c8449be5a65', 'authenticated', '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-b6a2-7c28-a8cc-95f8dea7a6c1', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-b696-7c48-8639-7c8449be5a65', 'anonymous', '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-de21-7db2-b2f6-f36e689fded8', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-de1b-77f0-a56f-21f46d611e9f', 'administrator', '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-de28-7b07-9389-4050d0ce8c0a', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-de1b-77f0-a56f-21f46d611e9f', 'authenticated', '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-de2e-78ad-a719-ab11c38c6314', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-de1b-77f0-a56f-21f46d611e9f', 'anonymous', '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-df0e-7ee9-8961-960515dc59b0', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-df08-7efd-a57e-3af6fdc50818', 'administrator', '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-df14-7b49-bb4a-cb9f3fd42c67', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-df08-7efd-a57e-3af6fdc50818', 'authenticated', '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-df1b-7266-bf7f-95589c131ce9', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-df08-7efd-a57e-3af6fdc50818', 'anonymous', '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-eb95-78b2-99bf-85dd72966c68', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-eb8e-76f9-994c-96fd9e43fb84', 'administrator', '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-eb9d-719c-95fc-54088b1d950a', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-eb8e-76f9-994c-96fd9e43fb84', 'authenticated', '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-eba3-746a-88cd-d1ae970bb4c5', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-eb8e-76f9-994c-96fd9e43fb84', 'anonymous', '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-ebdc-762a-86b8-075f1b7da9f7', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-ebd4-7653-bea1-2859dd7be736', 'administrator', '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-ebe2-7c82-9623-7e0d0a5410c0', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-ebd4-7653-bea1-2859dd7be736', 'authenticated', '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-ebe9-7de1-a934-ddc1913f93cd', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-ebd4-7653-bea1-2859dd7be736', 'anonymous', '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-f101-7508-9d24-79d29d285aff', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-f0fa-7146-b7fa-00233a299e55', 'administrator', '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-f108-7fd9-b8d1-fd9b9c66d88e', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-f0fa-7146-b7fa-00233a299e55', 'authenticated', '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-f10f-777e-9012-8c8779fdccac', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-f0fa-7146-b7fa-00233a299e55', 'anonymous', '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-f594-7811-b571-380db043bd0b', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-f58d-7257-917f-1fe82bc504f5', 'administrator', '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-f59c-782e-91a1-d6b9497e59c5', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-f58d-7257-917f-1fe82bc504f5', 'authenticated', '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-f5a3-75e8-8065-59413b2d20fb', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-f58d-7257-917f-1fe82bc504f5', 'anonymous', '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-f64d-7987-9fb6-056a2e61f36b', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-f645-7ca5-a122-8475448d4a63', 'administrator', '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-f655-7f44-afbd-05c1a9235035', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-f645-7ca5-a122-8475448d4a63', 'authenticated', '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-f65c-7e7f-89be-40605a4fc36e', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-f645-7ca5-a122-8475448d4a63', 'anonymous', '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-f69d-7a8a-abd0-f51e9b1b3462', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-f694-7fd5-9c99-332d33c3885e', 'administrator', '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-f6a5-7818-aa47-34ea2c9b087f', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-f694-7fd5-9c99-332d33c3885e', 'authenticated', '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-f6ac-77f1-b4b8-18cc78b7d24e', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-f694-7fd5-9c99-332d33c3885e', 'anonymous', '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-f86b-76ed-871e-19fe98f3a33f', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-f863-7c03-baaf-8a3fbe7dfd39', 'administrator', '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-f873-7f87-ae5b-5497f9dd3d87', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-f863-7c03-baaf-8a3fbe7dfd39', 'authenticated', '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-f87c-73f5-ad43-eb71f3ac3287', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-f863-7c03-baaf-8a3fbe7dfd39', 'anonymous', '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-f8c9-765d-931f-c2dfdcd3e561', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-f8bf-7484-a6fb-6d2a4d124761', 'administrator', '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-f8d2-7198-a13c-dd648675961f', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-f8bf-7484-a6fb-6d2a4d124761', 'authenticated', '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-f8d9-7d66-89f6-d6da0d64c296', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-f8bf-7484-a6fb-6d2a4d124761', 'anonymous', '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf5-00c2-71e7-acf3-a716e127ac19', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf5-00b9-7eb6-8e0b-a5b5e4e9a99c', 'administrator', '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf5-00ca-7e7d-9862-3cd7e73c30cc', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf5-00b9-7eb6-8e0b-a5b5e4e9a99c', 'authenticated', '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf5-00d3-77c1-b4d4-25ab54420332', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf5-00b9-7eb6-8e0b-a5b5e4e9a99c', 'anonymous', '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z');


SET session_replication_role TO DEFAULT;


