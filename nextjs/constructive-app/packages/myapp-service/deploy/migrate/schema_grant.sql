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
  ('019e917c-c701-7844-846e-c403aa993702', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-c6f3-7cfe-8e20-2872005ed46a', 'administrator'),
  ('019e917c-c706-7383-979b-9e82aacb272f', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-c6f3-7cfe-8e20-2872005ed46a', 'authenticated'),
  ('019e917c-c709-7f16-824c-2c4f5a9f5174', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-c6f3-7cfe-8e20-2872005ed46a', 'anonymous'),
  ('019e917c-c71d-7ca3-8b95-be01a8e7984b', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-c6f4-7509-8765-1c7add3329cd', 'administrator'),
  ('019e917c-c720-7f6f-bd80-c2f8b7f91fd5', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-c6f4-7509-8765-1c7add3329cd', 'authenticated'),
  ('019e917c-c724-718a-8ddc-4458ca1313fa', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-c6f4-7509-8765-1c7add3329cd', 'anonymous'),
  ('019e917c-c735-7278-8598-d42391267729', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-c732-73af-86d7-61993602b5ef', 'administrator'),
  ('019e917c-c737-7d3f-9728-fb75aba4d9b4', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-c732-73af-86d7-61993602b5ef', 'authenticated'),
  ('019e917c-c73a-7852-891b-24920f1c4288', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-c732-73af-86d7-61993602b5ef', 'anonymous'),
  ('019e917c-c749-7796-909b-6969c7c91067', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-c746-7b5f-8ccf-4c8add0cd703', 'administrator'),
  ('019e917c-c74c-70d6-bcca-8d73395adce4', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-c746-7b5f-8ccf-4c8add0cd703', 'authenticated'),
  ('019e917c-c74e-7b12-b1f7-c6d89b7bd732', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-c746-7b5f-8ccf-4c8add0cd703', 'anonymous'),
  ('019e917c-c761-7403-bf10-a19a50870767', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-c75e-769d-9faa-c68e3a60388f', 'administrator'),
  ('019e917c-c763-7ba8-86e9-a16c7e313e8d', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-c75e-769d-9faa-c68e3a60388f', 'authenticated'),
  ('019e917c-c766-746d-887f-5b88f6e4ab68', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-c75e-769d-9faa-c68e3a60388f', 'anonymous'),
  ('019e917c-c7f2-7235-8ac6-6e8f64235839', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-c7f0-7236-a174-ac435182f333', 'administrator'),
  ('019e917c-c7f4-7d81-a288-fb4165f40130', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-c7f0-7236-a174-ac435182f333', 'authenticated'),
  ('019e917c-c7f7-76e7-a27c-aa9ecfe94b3c', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-c7f0-7236-a174-ac435182f333', 'anonymous'),
  ('019e917c-c843-7606-9288-6a7a7882cd79', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-c841-76b3-af42-e57dfd9c76b2', 'administrator'),
  ('019e917c-c846-78e2-88a0-1eb8428d23a4', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-c841-76b3-af42-e57dfd9c76b2', 'authenticated'),
  ('019e917c-c849-747f-a71f-639c7d2ae5e7', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-c841-76b3-af42-e57dfd9c76b2', 'anonymous'),
  ('019e917c-c859-7c62-8c0f-141db42f4c0e', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-c856-7d16-a3a3-baf2b5dc5b44', 'administrator'),
  ('019e917c-c85c-7b4c-a794-5c03512fd92a', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-c856-7d16-a3a3-baf2b5dc5b44', 'authenticated'),
  ('019e917c-c85f-776f-aa6f-72254b9b5ba7', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-c856-7d16-a3a3-baf2b5dc5b44', 'anonymous'),
  ('019e917c-c8d8-7345-9fa5-124d499c7b97', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-c8d6-71ca-a98e-2f41b291294e', 'administrator'),
  ('019e917c-c8db-70d3-aa7a-20f24674e363', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-c8d6-71ca-a98e-2f41b291294e', 'authenticated'),
  ('019e917c-c8dd-7c4a-bba2-5d8a50b69606', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-c8d6-71ca-a98e-2f41b291294e', 'anonymous'),
  ('019e917c-c8ef-7c5f-b3e8-c83f49c476b6', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-c8ec-7140-b0b3-c7d939ed67ba', 'administrator'),
  ('019e917c-c8f2-7d47-9dfb-652bf69e8032', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-c8ec-7140-b0b3-c7d939ed67ba', 'authenticated'),
  ('019e917c-c8f5-7d96-a96e-632ab5c87fd4', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-c8ec-7140-b0b3-c7d939ed67ba', 'anonymous'),
  ('019e917c-cc4a-78a0-88ac-93233706374a', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-cc47-7b68-8560-d56484bdcb7e', 'administrator'),
  ('019e917c-cc4e-71e7-90e5-3a18d0f111e2', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-cc47-7b68-8560-d56484bdcb7e', 'authenticated'),
  ('019e917c-cc51-78d8-9ba3-764878fcc110', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-cc47-7b68-8560-d56484bdcb7e', 'anonymous'),
  ('019e917c-cf00-7b99-a97e-b1360ee9760b', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-cefd-7a33-8589-4d32ef636da1', 'administrator'),
  ('019e917c-cf04-78d0-8aaa-766146417ab8', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-cefd-7a33-8589-4d32ef636da1', 'authenticated'),
  ('019e917c-cf07-7ec9-8c5c-5c8ff85623ad', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-cefd-7a33-8589-4d32ef636da1', 'anonymous'),
  ('019e917c-cf1f-7dae-8d66-b077deac8295', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-cf1b-7e96-8a0f-0882c4734359', 'administrator'),
  ('019e917c-cf23-71fd-b18e-13c0278e79d8', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-cf1b-7e96-8a0f-0882c4734359', 'authenticated'),
  ('019e917c-cf26-7b2b-8681-4a5c35445ffe', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-cf1b-7e96-8a0f-0882c4734359', 'anonymous'),
  ('019e917c-d2c5-7f3c-a640-3373b98f4ccc', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-d2c2-725f-b21f-faac9034b650', 'administrator'),
  ('019e917c-d2ca-7a5e-ba17-e667b9d956b6', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-d2c2-725f-b21f-faac9034b650', 'authenticated'),
  ('019e917c-d2ce-7d4b-b258-8e4ff969a3aa', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-d2c2-725f-b21f-faac9034b650', 'anonymous'),
  ('019e917c-d2ef-78d6-9d4e-9913828eb7d5', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-d2ea-723c-a0e0-9bbe73c9820d', 'administrator'),
  ('019e917c-d2f3-7d25-a3b1-13ca549cc875', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-d2ea-723c-a0e0-9bbe73c9820d', 'authenticated'),
  ('019e917c-d2f7-7ff5-9027-4df38b9cf6f1', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-d2ea-723c-a0e0-9bbe73c9820d', 'anonymous'),
  ('019e917c-f7e3-7afb-81bf-6cd94dd68965', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-f7dd-78de-a2e0-656dfd691ce2', 'administrator'),
  ('019e917c-f7e9-79c9-a430-e47748eaf024', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-f7dd-78de-a2e0-656dfd691ce2', 'authenticated'),
  ('019e917c-f7f0-7148-8563-f3f3040412f7', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-f7dd-78de-a2e0-656dfd691ce2', 'anonymous'),
  ('019e917c-f8ce-7116-8ca9-1b9b0f6e2b0a', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-f8c8-71a7-a290-a547326f1537', 'administrator'),
  ('019e917c-f8d4-75c1-9b99-82d019a46aa3', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-f8c8-71a7-a290-a547326f1537', 'authenticated'),
  ('019e917c-f8da-7aca-b07e-63e39b9afd08', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-f8c8-71a7-a290-a547326f1537', 'anonymous'),
  ('019e917d-04ce-7f20-ba4c-09a9ba3cb3d4', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917d-04c8-71ca-b083-c314ec5be4c9', 'administrator'),
  ('019e917d-04d6-7307-852e-77a0c5106045', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917d-04c8-71ca-b083-c314ec5be4c9', 'authenticated'),
  ('019e917d-04dd-734e-9961-dc33d84c3578', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917d-04c8-71ca-b083-c314ec5be4c9', 'anonymous'),
  ('019e917d-0514-7d50-a937-d476cf5bb833', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917d-050d-72e6-8561-d4b8acf5a7b4', 'administrator'),
  ('019e917d-051c-7155-b673-0e825f94a5e2', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917d-050d-72e6-8561-d4b8acf5a7b4', 'authenticated'),
  ('019e917d-0523-73b3-9552-4274673478c4', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917d-050d-72e6-8561-d4b8acf5a7b4', 'anonymous'),
  ('019e917d-0a12-74d1-8a6f-4fe74305a128', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917d-0a0b-750d-b32c-510881b049fe', 'administrator'),
  ('019e917d-0a1a-7071-9db3-a97049b0dee1', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917d-0a0b-750d-b32c-510881b049fe', 'authenticated'),
  ('019e917d-0a20-7b3e-ac88-1fd5ce25f667', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917d-0a0b-750d-b32c-510881b049fe', 'anonymous'),
  ('019e917d-0e95-70c2-9c04-333180f7df4a', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917d-0e8d-7ce1-bda9-478afe2fc049', 'administrator'),
  ('019e917d-0e9d-73e1-9dac-2d2d07d9077d', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917d-0e8d-7ce1-bda9-478afe2fc049', 'authenticated'),
  ('019e917d-0ea3-7d0c-a447-a7a4133cf5ce', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917d-0e8d-7ce1-bda9-478afe2fc049', 'anonymous'),
  ('019e917d-0f39-7322-9888-8996134aaf71', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917d-0f31-7c9d-aa51-b57afb1ca42c', 'administrator'),
  ('019e917d-0f40-773a-b5e7-39829258dc07', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917d-0f31-7c9d-aa51-b57afb1ca42c', 'authenticated'),
  ('019e917d-0f48-78ad-bbbf-4c5261091fde', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917d-0f31-7c9d-aa51-b57afb1ca42c', 'anonymous'),
  ('019e917d-0f85-75be-ac71-2fa5e73c4209', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917d-0f7c-7e02-8f9f-2cc746c82430', 'administrator'),
  ('019e917d-0f8d-762c-8de1-3ef5053f3546', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917d-0f7c-7e02-8f9f-2cc746c82430', 'authenticated'),
  ('019e917d-0f94-757d-b670-b72483b43d6f', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917d-0f7c-7e02-8f9f-2cc746c82430', 'anonymous'),
  ('019e917d-114d-7707-aa48-e8109fec84a6', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917d-1145-7c59-b486-511857ea43bb', 'administrator'),
  ('019e917d-1156-7267-9abb-2cccc71c1974', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917d-1145-7c59-b486-511857ea43bb', 'authenticated'),
  ('019e917d-115d-79fd-9060-9bfb4a7b9493', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917d-1145-7c59-b486-511857ea43bb', 'anonymous'),
  ('019e917d-119c-72bb-89d1-5ed8bdccb3a0', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917d-1193-7977-bdad-3bf32a89b3a6', 'administrator'),
  ('019e917d-11a3-73fd-bcd8-d40f2bdf770a', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917d-1193-7977-bdad-3bf32a89b3a6', 'authenticated'),
  ('019e917d-11ab-71ef-a7f0-e6b162209f78', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917d-1193-7977-bdad-3bf32a89b3a6', 'anonymous'),
  ('019e917d-18fa-71a9-90b9-31a646334705', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917d-18f2-7163-8640-3153d16bbeb2', 'administrator'),
  ('019e917d-1902-7cc8-8d87-e355d7cc5297', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917d-18f2-7163-8640-3153d16bbeb2', 'authenticated'),
  ('019e917d-1909-7c89-9efc-4b5a2efe8273', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917d-18f2-7163-8640-3153d16bbeb2', 'anonymous');


SET session_replication_role TO DEFAULT;


