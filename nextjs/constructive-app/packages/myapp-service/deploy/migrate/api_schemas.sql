-- Deploy: migrate/api_schemas
-- made with <3 @ constructive.io

-- requires: migrate/api_modules


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

INSERT INTO services_public.api_schemas (
  id,
  database_id,
  schema_id,
  api_id
) VALUES
  ('019eaaf4-a9f3-7e10-9f0e-9c938d34ac5e', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-a9c9-7aef-b745-7f1f5cd5e610', '019eaaf4-a9f3-7aa0-97d3-bffbcccfe74c'),
  ('019eaaf4-a9f4-7800-b7eb-acd9dfae49a3', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-a98c-721b-917c-d43cc6b29b01', '019eaaf4-a9f3-7aa0-97d3-bffbcccfe74c'),
  ('019eaaf4-aa0b-7a7a-b34c-1bf03a39d656', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-a9f7-72b6-9a15-44faf2e40170', '019eaaf4-a9f3-78ca-9f79-1961e3031af5'),
  ('019eaaf4-ab09-77af-8514-e35167df60b7', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-aadb-778f-902a-91e751731d94', '019eaaf4-a9f3-72f5-8de7-eaadb9498833'),
  ('019eaaf4-aba3-7512-af2a-e190f35cf2a3', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-ab77-7082-874b-03ac48ee0667', '019eaaf4-a9f3-7c43-96db-e79b1cc717a2'),
  ('019eaaf4-aefb-745c-ab35-7f6393a4ccd5', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-aa88-7de6-b751-72f64d8bcc50', '019eaaf4-a9f3-72f5-8de7-eaadb9498833'),
  ('019eaaf4-b2c6-7969-b908-1459b00f2a78', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-b287-7afd-bef4-173fcebab403', '019eaaf4-a9f3-7c43-96db-e79b1cc717a2'),
  ('019eaaf4-b6ba-7303-9bcb-0a5d5fa42272', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-b672-7241-b447-aa32328ae3e1', '019eaaf4-a9f3-72f5-8de7-eaadb9498833'),
  ('019eaaf4-ef6a-777e-9e9d-8b7b1b23ef4f', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-de1b-77f0-a56f-21f46d611e9f', '019eaaf4-ef69-7366-a138-7d41c1fa503b'),
  ('019eaaf4-f146-717c-a703-e6f2b57b6cf7', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-f0fa-7146-b7fa-00233a299e55', '019eaaf4-ef69-7366-a138-7d41c1fa503b'),
  ('019eaaf4-f5d8-76d9-b3dc-da218a9dda50', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-f58d-7257-917f-1fe82bc504f5', '019eaaf4-a9f3-78ca-9f79-1961e3031af5'),
  ('019eaaf4-f6e1-726f-b78d-ee6e20f4b8da', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-f645-7ca5-a122-8475448d4a63', '019eaaf4-a9f3-78ca-9f79-1961e3031af5'),
  ('019eaaf4-f8bd-7d29-8006-e7a73a941926', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-f863-7c03-baaf-8a3fbe7dfd39', '019eaaf4-a9f3-72f5-8de7-eaadb9498833'),
  ('019eaaf5-010d-7ae8-997d-453bf86e0e59', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf5-00b9-7eb6-8e0b-a5b5e4e9a99c', '019eaaf4-a9f3-78ca-9f79-1961e3031af5'),
  ('019eaaf5-0ae0-73a0-a389-14da4523431c', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-a98c-7a02-91ff-02f38f427e28', '019eaaf4-a9f3-7aa0-97d3-bffbcccfe74c'),
  ('019eaaf5-0ae6-7e0b-958a-663592cf98ed', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-a9de-7ceb-8bbb-a20c7a8e0a1b', '019eaaf4-a9f3-7aa0-97d3-bffbcccfe74c'),
  ('019eaaf5-0aed-74ea-871c-181a9ac1d351', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-a9f7-72b6-9a15-44faf2e40170', '019eaaf4-a9f3-7aa0-97d3-bffbcccfe74c'),
  ('019eaaf5-0b22-7532-b5fe-6a371cacfe49', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-aa88-7de6-b751-72f64d8bcc50', '019eaaf4-a9f3-7aa0-97d3-bffbcccfe74c'),
  ('019eaaf5-0b5e-76a9-95ae-07c0b99401dd', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-aadb-778f-902a-91e751731d94', '019eaaf4-a9f3-7aa0-97d3-bffbcccfe74c'),
  ('019eaaf5-0b89-73c4-b218-b155b5cd53a0', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-aaf2-7540-a35a-612afc331b3d', '019eaaf4-a9f3-7aa0-97d3-bffbcccfe74c'),
  ('019eaaf5-0b9b-7004-bf81-2f52d39b8553', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-ab77-7082-874b-03ac48ee0667', '019eaaf4-a9f3-7aa0-97d3-bffbcccfe74c'),
  ('019eaaf5-0bd3-7fbc-93f9-3b7d66eb5186', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-ab8c-7326-b74d-76d82fad9f61', '019eaaf4-a9f3-7aa0-97d3-bffbcccfe74c'),
  ('019eaaf5-0bfe-7355-b373-1a89611df9ce', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-aed4-7b99-9fbe-be3017bb6b7f', '019eaaf4-a9f3-7aa0-97d3-bffbcccfe74c'),
  ('019eaaf5-0c25-7b8e-9681-c1fa16c1350f', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-b287-7afd-bef4-173fcebab403', '019eaaf4-a9f3-7aa0-97d3-bffbcccfe74c'),
  ('019eaaf5-0c58-7e5d-a0b7-cadb77aa5909', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-b2a7-7448-96b2-d23026c539d1', '019eaaf4-a9f3-7aa0-97d3-bffbcccfe74c'),
  ('019eaaf5-0c5c-7928-8a4b-b16ed6d01cfb', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-b672-7241-b447-aa32328ae3e1', '019eaaf4-a9f3-7aa0-97d3-bffbcccfe74c'),
  ('019eaaf5-0c8a-753b-bf27-7fa76a03c569', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-b696-7c48-8639-7c8449be5a65', '019eaaf4-a9f3-7aa0-97d3-bffbcccfe74c'),
  ('019eaaf5-0c8d-788a-a869-37d063653f48', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-de1b-77f0-a56f-21f46d611e9f', '019eaaf4-a9f3-7aa0-97d3-bffbcccfe74c'),
  ('019eaaf5-0cbb-7478-8f20-4744e99f38b0', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-df08-7efd-a57e-3af6fdc50818', '019eaaf4-a9f3-7aa0-97d3-bffbcccfe74c'),
  ('019eaaf5-0ce6-7d44-b58d-9ca3042f609a', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-eb8e-76f9-994c-96fd9e43fb84', '019eaaf4-a9f3-7aa0-97d3-bffbcccfe74c'),
  ('019eaaf5-0d0d-7c22-a1a2-19f5eb8f2cec', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-ebd4-7653-bea1-2859dd7be736', '019eaaf4-a9f3-7aa0-97d3-bffbcccfe74c'),
  ('019eaaf5-0d11-7703-a274-1c83bd26a378', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-f0fa-7146-b7fa-00233a299e55', '019eaaf4-a9f3-7aa0-97d3-bffbcccfe74c'),
  ('019eaaf5-0d39-7f05-9a16-488e74492c01', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-f58d-7257-917f-1fe82bc504f5', '019eaaf4-a9f3-7aa0-97d3-bffbcccfe74c'),
  ('019eaaf5-0d3d-7812-9050-1c32a3ac900d', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-f645-7ca5-a122-8475448d4a63', '019eaaf4-a9f3-7aa0-97d3-bffbcccfe74c'),
  ('019eaaf5-0d63-7b63-b0b0-c9c7fb2ac7ee', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-f694-7fd5-9c99-332d33c3885e', '019eaaf4-a9f3-7aa0-97d3-bffbcccfe74c'),
  ('019eaaf5-0d67-72c0-8034-08f614afb376', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-f863-7c03-baaf-8a3fbe7dfd39', '019eaaf4-a9f3-7aa0-97d3-bffbcccfe74c'),
  ('019eaaf5-0d91-7254-a335-c589102f7d6a', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-f8bf-7484-a6fb-6d2a4d124761', '019eaaf4-a9f3-7aa0-97d3-bffbcccfe74c'),
  ('019eaaf5-0d94-78ee-8dee-13063c92cd6f', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf5-00b9-7eb6-8e0b-a5b5e4e9a99c', '019eaaf4-a9f3-7aa0-97d3-bffbcccfe74c'),
  ('019eaaf5-0de7-7796-b6e2-431ca8553bfb', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf5-0dce-7227-b01c-546538a95034', '019eaaf5-0de1-7c4b-aceb-8c5797cea3d6');


SET session_replication_role TO DEFAULT;


