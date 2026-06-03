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
  grantee_name
) VALUES
  ('019e8c61-49ad-7eae-a258-1fe7c9747500', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-49a0-7ac1-950a-16310a95c129', 'administrator'),
  ('019e8c61-49b2-767b-90f8-2a65cd20c84f', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-49a0-7ac1-950a-16310a95c129', 'authenticated'),
  ('019e8c61-49b6-7117-8b0a-e6e624d630bf', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-49a0-7ac1-950a-16310a95c129', 'anonymous'),
  ('019e8c61-49cb-742f-b947-9f468f52f275', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-49a1-75b6-9cbb-ac1d04f63115', 'administrator'),
  ('019e8c61-49ce-7b38-a418-e50ae5c01df4', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-49a1-75b6-9cbb-ac1d04f63115', 'authenticated'),
  ('019e8c61-49d1-7e20-8c4e-cf3d86057723', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-49a1-75b6-9cbb-ac1d04f63115', 'anonymous'),
  ('019e8c61-49e4-7927-916c-79adb149b256', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-49e1-75a4-9a57-e3f79a96bdc6', 'administrator'),
  ('019e8c61-49e7-76f7-bfba-ba9f661db935', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-49e1-75a4-9a57-e3f79a96bdc6', 'authenticated'),
  ('019e8c61-49ea-7644-88d5-143ffe235f12', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-49e1-75a4-9a57-e3f79a96bdc6', 'anonymous'),
  ('019e8c61-49f9-7e5b-b5ca-f93af3e0554b', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-49f7-71a4-bd66-0c7899f0f8b8', 'administrator'),
  ('019e8c61-49fc-7672-9869-13d076322831', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-49f7-71a4-bd66-0c7899f0f8b8', 'authenticated'),
  ('019e8c61-49ff-70ae-8a7c-a7509caf5461', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-49f7-71a4-bd66-0c7899f0f8b8', 'anonymous'),
  ('019e8c61-4a11-79e6-a9d3-5078799df2f9', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4a0e-7988-9f2d-cad4db71ff77', 'administrator'),
  ('019e8c61-4a14-72bf-89a8-f9b2ed825087', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4a0e-7988-9f2d-cad4db71ff77', 'authenticated'),
  ('019e8c61-4a16-7c5d-8d44-fe1cccd64fdc', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4a0e-7988-9f2d-cad4db71ff77', 'anonymous'),
  ('019e8c61-4aa7-7fb5-8976-8c8ed75d494b', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4aa5-7ee8-b6fe-28b0e2768392', 'administrator'),
  ('019e8c61-4aaa-7da5-bf20-089f8fa65556', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4aa5-7ee8-b6fe-28b0e2768392', 'authenticated'),
  ('019e8c61-4aad-77db-9ce9-8fd5de19a651', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4aa5-7ee8-b6fe-28b0e2768392', 'anonymous'),
  ('019e8c61-4b00-7b42-b6fc-c68ea8e53539', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4afe-77fc-a88c-8b17ed435e82', 'administrator'),
  ('019e8c61-4b03-7ecd-9f86-063a834e8a14', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4afe-77fc-a88c-8b17ed435e82', 'authenticated'),
  ('019e8c61-4b06-7ea1-b766-aadb6f01a0d0', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4afe-77fc-a88c-8b17ed435e82', 'anonymous'),
  ('019e8c61-4b19-7e99-bf6d-6ed407f80cc6', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4b16-7849-b914-d3923fa00fe8', 'administrator'),
  ('019e8c61-4b1c-7db2-84a6-fec64907a01a', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4b16-7849-b914-d3923fa00fe8', 'authenticated'),
  ('019e8c61-4b1f-7af3-b03b-5c930591d410', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4b16-7849-b914-d3923fa00fe8', 'anonymous'),
  ('019e8c61-4ba8-73bc-9ff8-3959c04b7176', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4ba6-703e-be8a-8e32073223f1', 'administrator'),
  ('019e8c61-4bab-7608-a708-a81696676a2d', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4ba6-703e-be8a-8e32073223f1', 'authenticated'),
  ('019e8c61-4bae-74cc-99c5-5fdbe0ca79a7', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4ba6-703e-be8a-8e32073223f1', 'anonymous'),
  ('019e8c61-4bbf-7f8f-be96-4f55832cb563', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4bbc-797f-9e0d-ae185ea9a75e', 'administrator'),
  ('019e8c61-4bc3-728d-abfe-f6d3d325092b', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4bbc-797f-9e0d-ae185ea9a75e', 'authenticated'),
  ('019e8c61-4bc6-7236-82f6-37208e91e093', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4bbc-797f-9e0d-ae185ea9a75e', 'anonymous'),
  ('019e8c61-4f38-701a-9729-50f15af00504', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4f34-73ee-a5e2-d2e07ad61720', 'administrator'),
  ('019e8c61-4f3b-7f2d-b78f-83dd7c4d5edd', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4f34-73ee-a5e2-d2e07ad61720', 'authenticated'),
  ('019e8c61-4f3f-7c1e-8fce-df15b1b411ec', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4f34-73ee-a5e2-d2e07ad61720', 'anonymous'),
  ('019e8c61-526f-70ec-ae60-e06c7377157e', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-526b-7c17-a063-9c0b9fb68faa', 'administrator'),
  ('019e8c61-5272-7d7d-a8d5-f83deb3eb8e2', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-526b-7c17-a063-9c0b9fb68faa', 'authenticated'),
  ('019e8c61-5276-7525-8ad6-05967675f42a', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-526b-7c17-a063-9c0b9fb68faa', 'anonymous'),
  ('019e8c61-5290-7cfb-bfb4-331034b55061', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-528c-7456-b4f5-cba30c7894d9', 'administrator'),
  ('019e8c61-5294-7769-85e7-bb276d62726e', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-528c-7456-b4f5-cba30c7894d9', 'authenticated'),
  ('019e8c61-5298-7870-90b0-d2b2a592543b', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-528c-7456-b4f5-cba30c7894d9', 'anonymous'),
  ('019e8c61-56a0-7db8-8bfb-8b43b1ab3789', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-569c-7808-a894-885958141911', 'administrator'),
  ('019e8c61-56a5-7c2c-9cf6-000a8f69c0c4', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-569c-7808-a894-885958141911', 'authenticated'),
  ('019e8c61-56aa-71bc-ad8f-605054681d5e', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-569c-7808-a894-885958141911', 'anonymous'),
  ('019e8c61-56c8-79ef-baf8-462bb64db201', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-56c3-7ea1-ba86-833a00e287c4', 'administrator'),
  ('019e8c61-56cc-7a06-8590-6e93e66694e2', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-56c3-7ea1-ba86-833a00e287c4', 'authenticated'),
  ('019e8c61-56d0-7fb8-865c-770baf1bcf8b', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-56c3-7ea1-ba86-833a00e287c4', 'anonymous'),
  ('019e8c61-7e8e-75ac-bdd7-8e6a1121591b', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-7e88-7171-bc93-3dc8a46f2dbb', 'administrator'),
  ('019e8c61-7e94-763d-a520-0024425a3187', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-7e88-7171-bc93-3dc8a46f2dbb', 'authenticated'),
  ('019e8c61-7e9b-705a-b5a5-af237e9b190d', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-7e88-7171-bc93-3dc8a46f2dbb', 'anonymous'),
  ('019e8c61-7f84-745f-81e7-abe30706f1ff', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-7f7e-7366-93d8-7cb135ff10b4', 'administrator'),
  ('019e8c61-7f8a-76d3-8969-01dfc02e60c7', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-7f7e-7366-93d8-7cb135ff10b4', 'authenticated'),
  ('019e8c61-7f91-7128-893b-f4ecb1cddb56', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-7f7e-7366-93d8-7cb135ff10b4', 'anonymous'),
  ('019e8c61-8c21-7fdf-855d-321990f2f748', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-8c19-7c16-9da8-8302fab9a2a2', 'administrator'),
  ('019e8c61-8c2a-7864-bd59-9cc1d3665001', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-8c19-7c16-9da8-8302fab9a2a2', 'authenticated'),
  ('019e8c61-8c32-70be-b458-869008f78613', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-8c19-7c16-9da8-8302fab9a2a2', 'anonymous'),
  ('019e8c61-8c6a-7d6a-a03b-46d5367cf900', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-8c62-7afa-af2d-b32b0c82d082', 'administrator'),
  ('019e8c61-8c72-7231-991a-4d28b19b7a82', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-8c62-7afa-af2d-b32b0c82d082', 'authenticated'),
  ('019e8c61-8c79-7700-b60b-dd71045e4f09', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-8c62-7afa-af2d-b32b0c82d082', 'anonymous'),
  ('019e8c61-9190-78f3-adc0-862f357400f8', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-9189-70ce-95d5-a7fd7d779a93', 'administrator'),
  ('019e8c61-9198-784c-bc9b-443abbb2f44c', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-9189-70ce-95d5-a7fd7d779a93', 'authenticated'),
  ('019e8c61-919f-778c-b0fc-382ef640d740', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-9189-70ce-95d5-a7fd7d779a93', 'anonymous'),
  ('019e8c61-96ad-70cf-b4a9-3720154e79e0', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-96a5-773e-bb49-a2c70e4713ff', 'administrator'),
  ('019e8c61-96b5-7629-b15e-808d7a5f19bc', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-96a5-773e-bb49-a2c70e4713ff', 'authenticated'),
  ('019e8c61-96bc-737d-a6be-4f83889e67c0', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-96a5-773e-bb49-a2c70e4713ff', 'anonymous'),
  ('019e8c61-975b-73f1-988f-1fe05cb320da', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-9753-75b8-a09f-c571535167ab', 'administrator'),
  ('019e8c61-9762-7704-bc17-7e610ad61cdd', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-9753-75b8-a09f-c571535167ab', 'authenticated'),
  ('019e8c61-976a-74c9-90b8-82dedf8e92a1', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-9753-75b8-a09f-c571535167ab', 'anonymous'),
  ('019e8c61-97ab-710e-9175-a36e8536cb21', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-97a2-70e7-9173-a157b4a7e66b', 'administrator'),
  ('019e8c61-97b2-7e47-a844-3a4374b9e8bf', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-97a2-70e7-9173-a157b4a7e66b', 'authenticated'),
  ('019e8c61-97ba-724a-8f33-52d387c734da', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-97a2-70e7-9173-a157b4a7e66b', 'anonymous'),
  ('019e8c61-998e-7ca5-9764-7393578bc906', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-9987-77c3-a908-9d091c0819ea', 'administrator'),
  ('019e8c61-9997-733d-ac21-9ae9ebfb9f69', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-9987-77c3-a908-9d091c0819ea', 'authenticated'),
  ('019e8c61-999f-7a51-befb-520f314d4470', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-9987-77c3-a908-9d091c0819ea', 'anonymous'),
  ('019e8c61-99e8-7c64-9556-65eb8579038b', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-99de-7790-907d-e76ed31e6fae', 'administrator'),
  ('019e8c61-99f1-71cb-b3a3-562981bef18f', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-99de-7790-907d-e76ed31e6fae', 'authenticated'),
  ('019e8c61-99f9-7d6e-b5f3-d47d531746ac', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-99de-7790-907d-e76ed31e6fae', 'anonymous'),
  ('019e8c61-a1bb-7e70-8c99-c011c0831616', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-a1b3-7312-9fb5-48dd943188ae', 'administrator'),
  ('019e8c61-a1c4-7ff3-a648-adb361e03079', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-a1b3-7312-9fb5-48dd943188ae', 'authenticated'),
  ('019e8c61-a1cc-79d8-af57-fa4e41f87c30', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-a1b3-7312-9fb5-48dd943188ae', 'anonymous');


SET session_replication_role TO DEFAULT;


