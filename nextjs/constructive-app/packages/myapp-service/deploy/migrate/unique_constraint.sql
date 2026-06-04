-- Deploy: migrate/unique_constraint
-- made with <3 @ constructive.io

-- requires: migrate/primary_key_constraint


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

INSERT INTO metaschema_public.unique_constraint (
  id,
  database_id,
  table_id,
  name,
  description,
  smart_tags,
  type,
  field_ids
) VALUES
  ('019e917c-c793-739f-a421-be5645e25d8c', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-c772-7ad9-bec4-337ce1956129', 'users_username_key', NULL, NULL, 'u', '{019e917c-c78c-70ae-b71d-036e3e7248b8}'),
  ('019e917c-c7c2-7b5d-991d-91de6bc86ebc', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-c7b1-7312-bcff-4d41a07d5ada', 'role_types_name_key', NULL, NULL, 'u', '{019e917c-c7be-76f7-948e-1fdd184f99e0}'),
  ('019e917c-c834-7f1f-ac56-ca22a9e85a13', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-c803-7904-8ee6-91b33d737e81', 'membership_types_name_key', NULL, NULL, 'u', '{019e917c-c818-7073-9f7d-5ab96cfff173}'),
  ('019e917c-c888-72ab-90ac-4bd336dbc0df', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-c86e-7965-813c-c19099a78a80', 'app_permissions_name_key', NULL, NULL, 'u', '{019e917c-c883-735e-9907-921c93af6674}'),
  ('019e917c-c892-7dbf-aeac-629fb68ff81d', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-c86e-7965-813c-c19099a78a80', 'app_permissions_bitnum_key', NULL, NULL, 'u', '{019e917c-c88b-75b2-ad7a-772881c84fc5}'),
  ('019e917c-c95d-7102-9cb2-450e3b903805', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-c908-7442-bfa8-8c34d5047e3d', 'app_limits_name_actor_id_key', NULL, NULL, 'u', '{019e917c-c920-7ba3-b0af-e142d1a6a21d,019e917c-c925-7f6f-9db1-e2ea37c58076}'),
  ('019e917c-c989-7d6a-b652-baab6acb02f0', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-c969-769e-8937-c8bff7210a96', 'app_limit_defaults_name_key', NULL, NULL, 'u', '{019e917c-c97a-7a88-832e-31b99f07d421}'),
  ('019e917c-caad-7c27-967f-6a7f5e104063', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-ca84-78e3-b9c9-d440fb6adafc', 'app_limit_credit_codes_code_key', NULL, NULL, 'u', '{019e917c-caa2-7d6f-b710-1f436b2b049e}'),
  ('019e917c-cb14-7911-9df8-7bbb2f49ba5d', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-cad5-7e34-b382-0cbc3adcec35', 'app_limit_credit_code_items_credit_code_id_default_limit_id_key', NULL, NULL, 'u', '{019e917c-caea-70af-8900-8463808c6756,019e917c-caf5-760d-bd22-4d177df91532}'),
  ('019e917c-cb55-7beb-8684-52ca23182cb3', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-cb25-7064-b1ba-1750c039caa2', 'app_limit_credit_redemptions_credit_code_id_entity_id_key', NULL, NULL, 'u', '{019e917c-cb38-7ab2-81b4-4944fb4eace6,019e917c-cb43-7d3a-b8fa-dce4917febc7}'),
  ('019e917c-cb8f-71ff-9e2b-c2c8c882988f', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-cb67-7a78-9dcb-26cde558af13', 'app_limit_caps_defaults_name_key', NULL, NULL, 'u', '{019e917c-cb7c-7704-a727-f743c6dcc8f2}'),
  ('019e917c-cbc2-7d0e-8ebf-df93b3b5ac7f', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-cb93-7161-8150-6ec5790d38a0', 'app_limit_caps_name_entity_id_key', NULL, NULL, 'u', '{019e917c-cba8-7d42-8232-ca05d0c8262f,019e917c-cbb1-7bcb-9199-1dceca128be4}'),
  ('019e917c-cc04-75a3-993b-3309f47fa82a', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-cbd1-7ec0-86c9-31bbc185a974', 'app_limit_warnings_name_key', NULL, NULL, 'u', '{019e917c-cbe6-73ad-821f-8bc35964e91c}'),
  ('019e917c-cc3b-783b-ad4c-6d132c58b2e4', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-cc08-7482-8fe3-345de15234e5', 'app_limit_warning_states_warning_id_actor_id_key', NULL, NULL, 'u', '{019e917c-cc1c-7909-9f24-6c3aaeb49415,019e917c-cc28-7151-8a86-48d2b0b25ab3}'),
  ('019e917c-cda8-7a5b-82bd-77e3cc083423', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-cc6c-7041-afc8-7e92b06a6f7c', 'app_memberships_actor_id_key', NULL, NULL, 'u', '{019e917c-cd9b-708c-818a-efe3f4df72f7}'),
  ('019e917c-d01d-741c-b89f-3bc5cd3c631c', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-cfd1-7c2e-9100-b2c020aeb3ea', 'app_event_aggregates_actor_id_name_key', NULL, NULL, 'u', '{019e917c-cfec-7d59-b57d-0b0690b10457,019e917c-d000-78e2-bde7-ef9baebfdb29}'),
  ('019e917c-d0a1-7ede-a58c-3e0acded4e9e', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-d037-7e8c-9e49-d163f3e010cf', 'app_event_types_name_key', NULL, NULL, 'u', '{019e917c-d050-7b17-b2d7-d2910dc0f81d}'),
  ('019e917c-d0fc-70ac-b4eb-16aec91eea8b', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-d0ba-76bf-8adc-16e78c09638e', 'app_levels_name_key', NULL, NULL, 'u', '{019e917c-d0d3-7a8c-8ba0-8dff22633c9b}'),
  ('019e917c-d161-727f-ab2c-7c5ca0fb0d5c', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-d114-7725-ad25-fc44639ff08f', 'app_level_requirements_name_level_key', NULL, NULL, 'u', '{019e917c-d12e-7bd9-a6c0-500fbab2a7bd,019e917c-d139-7b05-a7d7-85c985b6408f}'),
  ('019e917c-d1c9-77e2-807a-3c4f89a70f6f', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-d183-7158-b589-d515ff0087c3', 'app_level_grants_actor_id_level_name_period_start_key', NULL, NULL, 'u', '{019e917c-d19c-7bcf-8ac9-62e4869a6914,019e917c-d1b0-7c8e-a3eb-9a8aa02fd141,019e917c-d1bb-77f7-a397-817206135711}'),
  ('019e917c-d397-7199-8096-ea939d0e4324', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-d31b-73f0-b901-bd7fd7886eaa', 'app_profiles_name_key', NULL, NULL, 'u', '{019e917c-d33b-72e3-a923-079495fd6188}'),
  ('019e917c-d39c-7f6f-abe2-5ec866f65e53', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-d31b-73f0-b901-bd7fd7886eaa', 'app_profiles_slug_key', NULL, NULL, 'u', '{019e917c-d346-7128-93f7-9e312f858907}'),
  ('019e917c-d3ed-72f4-8fc1-28d05a2b4bc1', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-d3ab-7618-8e9d-325de97ff925', 'app_profile_permissions_profile_id_permission_id_key', NULL, NULL, 'u', '{019e917c-d3c6-7a98-a911-726bfd273bf7,019e917c-d3d8-7003-a564-a7b88e93840c}'),
  ('019e917c-d5b0-708e-a713-0ecfd2464412', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-d543-7e94-9463-cd65b284a50c', 'app_profile_templates_name_key', NULL, NULL, 'u', '{019e917c-d560-70a4-b48c-d9fb8f1babbe}'),
  ('019e917c-d5b5-77e4-954e-f1fc3b78582a', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-d543-7e94-9463-cd65b284a50c', 'app_profile_templates_slug_key', NULL, NULL, 'u', '{019e917c-d56b-7f48-982d-633cd53190b5}'),
  ('019e917c-d937-7955-a010-36d8086ee6b7', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-d90f-71bb-84f8-6e668302c9af', 'org_permissions_name_key', NULL, NULL, 'u', '{019e917c-d92e-733c-ab98-464ecb0b7552}'),
  ('019e917c-d94a-7e6e-8e58-b831bb582633', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-d90f-71bb-84f8-6e668302c9af', 'org_permissions_bitnum_key', NULL, NULL, 'u', '{019e917c-d93d-76a5-ab6a-69bcfd1d56d1}'),
  ('019e917c-da76-79f7-965f-b6faa9fe508e', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-d9cf-7f6c-b748-d5790c865dd3', 'org_limits_name_actor_id_entity_id_key', NULL, NULL, 'u', '{019e917c-d9ee-7c8e-af01-cb4fa5224737,019e917c-d9f9-7f1d-904a-5c1505c800f0,019e917c-da63-7667-8f05-771b8927619a}'),
  ('019e917c-dac8-7ec2-b5d7-06585a2fb4ec', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-da8c-739c-b716-ba8f19541bc2', 'org_limit_defaults_name_key', NULL, NULL, 'u', '{019e917c-daac-74f2-9145-309827ab8270}'),
  ('019e917c-dc42-742a-bdbf-7b07c82ac836', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-db9b-7f51-8354-163bd67ea789', 'org_limit_aggregates_name_entity_id_key', NULL, NULL, 'u', '{019e917c-dbbb-78fc-898f-a9ede8a248ef,019e917c-dbc5-7932-bf51-11260edb68aa}'),
  ('019e917c-dda7-7c25-b653-caa7b9e41f59', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-dd6b-79bc-90f0-0fa632b7cad3', 'org_limit_caps_defaults_name_key', NULL, NULL, 'u', '{019e917c-dd8b-7412-a1cc-cd3962e7e6be}'),
  ('019e917c-ddfb-751b-9265-47ef43996bc3', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-ddad-7701-a6f6-556e710388bf', 'org_limit_caps_name_entity_id_key', NULL, NULL, 'u', '{019e917c-ddcd-7093-868a-5dbea0a19bc4,019e917c-ddda-76ab-948e-2f63e50fe1a9}'),
  ('019e917c-de79-7e66-ac47-8b355fa39b49', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-de15-700b-acf1-e28d7db7d478', 'org_limit_warnings_name_entity_id_key', NULL, NULL, 'u', '{019e917c-de36-7aac-a31e-75810c2e3a26,019e917c-de6b-7581-be76-2a71596b5d32}'),
  ('019e917c-dee0-7415-b09b-5eae610c8750', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-de80-7194-aa56-b36ca1ec3196', 'org_limit_warning_states_warning_id_actor_id_entity_id_key', NULL, NULL, 'u', '{019e917c-de9f-7cc0-8c5b-eb1d40659121,019e917c-deb1-7ac7-9999-d50346480eb8,019e917c-ded1-7528-8050-33d00c9e811c}'),
  ('019e917c-e03e-7005-9cd0-9f80dd8426a6', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-df4a-74aa-b218-a5cd5b8222f9', 'org_membership_defaults_entity_id_key', NULL, NULL, 'u', '{019e917c-e02a-7fda-8c5e-4a3ed98537f6}'),
  ('019e917c-e0ab-7afc-b623-19e26875a9fb', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-e043-7ff2-8cfd-fdb539d8b720', 'org_membership_settings_entity_id_key', NULL, NULL, 'u', '{019e917c-e098-792a-ae4b-48e5d55a742f}'),
  ('019e917c-e1f3-7974-9bbb-a1e1a80c3d7e', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-def8-70ad-aafa-13e9d90450c3', 'org_memberships_actor_id_entity_id_key', NULL, NULL, 'u', '{019e917c-e1cc-7616-ab73-499970d428c0,019e917c-e1df-7c6b-b67d-44a923ac03d1}'),
  ('019e917c-e275-763d-ad6a-d13e1424c2df', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-e216-7e98-ab47-351109e8153a', 'org_members_actor_id_entity_id_key', NULL, NULL, 'u', '{019e917c-e24d-7613-892d-b01b47915eb3,019e917c-e260-7e5e-94bd-edee51b70b85}'),
  ('019e917c-e44a-7f6e-a62e-93247aa6981c', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-e3f4-7880-a960-30c5f744c50f', 'org_member_profiles_membership_id_key', NULL, NULL, 'u', '{019e917c-e434-7d86-9d52-ff53c28cd495}'),
  ('019e917c-e4cf-7583-80ac-24aec546a932', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-e3f4-7880-a960-30c5f744c50f', 'org_member_profiles_actor_id_entity_id_key', NULL, NULL, 'u', '{019e917c-e46b-72a6-9f17-c377e88c11a0,019e917c-e450-7fab-8418-7cee7b59c701}'),
  ('019e917c-e6b1-7467-8217-6c9cc8b7ff55', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-e5f3-7942-9dbd-8bfcd241a428', 'org_profiles_name_entity_id_key', NULL, NULL, 'u', '{019e917c-e617-7aae-9ab6-56331993d332,019e917c-e699-7d66-a32c-5cf5d40862ab}'),
  ('019e917c-e6b7-7911-818d-857224ac3ded', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-e5f3-7942-9dbd-8bfcd241a428', 'org_profiles_slug_entity_id_key', NULL, NULL, 'u', '{019e917c-e627-74ea-8a3c-bf06d1f2b6e8,019e917c-e699-7d66-a32c-5cf5d40862ab}'),
  ('019e917c-e742-78ca-be24-5c8f1260bc42', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-e6cd-7f6f-b52c-711ef9ad4484', 'org_profile_permissions_profile_id_permission_id_key', NULL, NULL, 'u', '{019e917c-e70e-7583-937b-ad0f259a802d,019e917c-e725-7369-8ccc-caba5282b6b2}'),
  ('019e917c-e9ad-7e2f-b755-1176b1a859b3', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-e914-76a7-b721-6add1de9fe69', 'org_profile_templates_name_key', NULL, NULL, 'u', '{019e917c-e93a-7e60-991c-70351bdea61b}'),
  ('019e917c-e9b4-795e-b0e5-b0f1a9dffe46', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-e914-76a7-b721-6add1de9fe69', 'org_profile_templates_slug_key', NULL, NULL, 'u', '{019e917c-e94a-7e0f-9dda-5f0db8d7a73e}'),
  ('019e917c-eb6c-7f89-b6e1-cbd331bb76b0', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-eace-7e97-835e-13020e6d9194', 'org_event_aggregates_actor_id_name_entity_id_key', NULL, NULL, 'u', '{019e917c-eaf6-75f4-9567-2931f7444022,019e917c-eb13-71e8-9b9c-2e4574ebd396,019e917c-eb44-75cf-911f-9f56e26ae234}'),
  ('019e917c-ec64-7a86-a084-ca418bced096', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-eb9c-744c-a4a3-a66548d40bf0', 'org_event_types_name_entity_id_key', NULL, NULL, 'u', '{019e917c-ebc5-7b15-96f7-d296d9f19187,019e917c-ec51-7ce6-9b9a-d51c94da2ce3}'),
  ('019e917c-ed14-7413-b576-c957c02cf90a', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-ec92-7ffa-9d03-863666d11e48', 'org_levels_name_entity_id_key', NULL, NULL, 'u', '{019e917c-ecb9-7459-a23d-06265a221bef,019e917c-ed01-7cd2-8bb8-5b428fd482f1}'),
  ('019e917c-edcf-7273-9b28-0520acfcfcd4', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-ed41-7a47-a284-5fe7054ef7f6', 'org_level_requirements_name_level_entity_id_key', NULL, NULL, 'u', '{019e917c-ed69-7e98-8227-45e7fa1f9ce6,019e917c-ed7b-71e9-b3a3-2ba3603af26d,019e917c-edbd-7813-9d61-463048681a64}'),
  ('019e917c-ee8a-75c2-906d-56707438a39e', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-ee0c-72c4-93b3-e5dfafc558b2', 'org_level_grants_actor_id_level_name_period_start_entity_id_key', NULL, NULL, 'u', '{019e917c-ee32-7b66-ba65-309ec587c273,019e917c-ee52-7d31-9c24-03565e72be8b,019e917c-ee63-785c-9a2c-6e4b03901246,019e917c-ee77-7d00-9d0c-a5f50b4cab78}'),
  ('019e917c-f59c-75a7-bfed-44d9d3cf1f04', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-f4f2-7415-82e3-1b38f0540eb3', 'org_chart_edges_entity_id_child_id_key', NULL, NULL, 'u', '{019e917c-f53f-750a-b361-b6460195dbc6,019e917c-f558-71e0-b943-d708bd673bd8}'),
  ('019e917c-f87c-7eaf-80ac-a6138a2df9b3', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-f818-79c1-aaf6-8dbe845fb23d', 'user_states_owner_id_name_key', NULL, NULL, 'u', '{019e917c-f845-71fb-80e8-22bf1c16a3ef,019e917c-f855-7a47-a32e-840f3e9ff39e}'),
  ('019e917c-fb4c-7c2f-8a90-11f4b88ad5a8', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-fa3c-76fb-8569-554b1a4b8d0e', 'session_credentials_secret_hash_key', NULL, NULL, 'u', '{019e917c-fa9c-7544-997d-e8884b8e6959}'),
  ('019e917c-fb55-73fb-b609-13bda556beb0', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-fa3c-76fb-8569-554b1a4b8d0e', 'session_credentials_key_id_key', NULL, NULL, 'u', '{019e917c-fa8f-7e7e-8c77-4496eb85d54f}'),
  ('019e917c-fb5e-74ea-a87d-dd4c1b3f0043', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-fa3c-76fb-8569-554b1a4b8d0e', 'session_credentials_ot_token_key', NULL, NULL, 'u', '{019e917c-faec-74c9-958a-9765938ab861}'),
  ('019e917d-015a-7f50-acec-5ce278dcf14d', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917d-00b0-7db3-b665-3dc3b0e00260', 'session_secrets_session_id_name_key', NULL, NULL, 'u', '{019e917d-00de-7662-a2e3-b6ac1607187b,019e917d-00ff-7e42-9de9-9afa9d5f8fc8}'),
  ('019e917d-03d1-7bde-bf15-f4fbbdb8217d', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917d-0304-72f7-9e10-d76721e2e685', 'auth_ip_rate_limits_ip_address_ua_hash_action_key', NULL, NULL, 'u', '{019e917d-0332-7951-8be3-331c5f967298,019e917d-0347-7bf3-b9c4-ba3063c3dd4f,019e917d-0363-7f45-bc67-5e582f25ee3f}'),
  ('019e917d-04ae-7a7f-8777-f6f6d46f382e', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917d-03e8-7269-b6b3-3a43f76942f2', 'auth_rate_limits_subject_id_action_key', NULL, NULL, 'u', '{019e917d-0418-71d7-bc67-52b4ee62ae21,019e917d-042c-776d-9cfd-691bd44c955f}'),
  ('019e917d-064e-7d59-a57e-44ac05f60509', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917d-0558-71ab-b908-9360125ec648', 'app_namespaces_name_key', NULL, NULL, 'u', '{019e917d-05c1-764e-bc0c-0fe361119356}'),
  ('019e917d-0658-7b74-9bf6-4a5df18bf374', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917d-0558-71ab-b908-9360125ec648', 'app_namespaces_namespace_name_key', NULL, NULL, 'u', '{019e917d-05da-7502-917f-2138ad1a7f57}'),
  ('019e917d-0990-7a1f-9eb3-229683dc4f90', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917d-08e8-7b39-a720-f7005f011c33', 'user_secrets_owner_id_name_key', NULL, NULL, 'u', '{019e917d-0919-7115-ace0-8973b5005bad,019e917d-092c-769c-b9a8-b9cf3380fcd4}'),
  ('019e917d-0b88-7296-b650-f8655a3fbda1', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917d-0a53-794b-876d-af7f636589ff', 'app_secrets_namespace_id_name_key', NULL, NULL, 'u', '{019e917d-0aa2-7f3b-a964-7e4d4c1071a9,019e917d-0ac2-7033-8d29-42333139f2e5}'),
  ('019e917d-0d05-746f-9e82-f34fa65708c8', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917d-0c02-73fd-b716-b940e3899dbb', 'app_configs_namespace_id_name_key', NULL, NULL, 'u', '{019e917d-0c30-78d9-93b4-9a5d088305b0,019e917d-0c4e-71b9-96b9-9e6e656a656f}'),
  ('019e917d-0dc3-74d0-ba13-be6dac273416', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917d-0d4c-7a89-9385-66308b2c589c', 'app_config_definitions_name_key', NULL, NULL, 'u', '{019e917d-0dac-71ea-b49a-23dcb7ca01b2}'),
  ('019e917d-1096-7c4a-9a83-80bc06e9ae5c', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917d-0fcc-715e-9816-b34b39bf6205', 'emails_email_key', NULL, NULL, 'u', '{019e917d-1031-738c-aa82-0c074f03db2a}'),
  ('019e917d-1352-7e48-8745-e2b6b7850d01', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917d-11e2-7499-a4f8-4437c1de9ae3', 'app_invites_invite_token_key', NULL, NULL, 'u', '{019e917d-1254-74b6-911e-e8b75cc54076}'),
  ('019e917d-135d-79d7-8c1a-6e1e41460490', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917d-11e2-7499-a4f8-4437c1de9ae3', 'app_invites_email_sender_id_key', NULL, NULL, 'u', '{019e917d-1220-72f4-a69c-7b0e986d8568,019e917d-1239-7014-a091-2c69fbf64336}'),
  ('019e917d-16ac-74b1-897a-c5fe9dee3a6c', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917d-1505-7e4b-8c46-7c080144f34c', 'org_invites_invite_token_key', NULL, NULL, 'u', '{019e917d-1585-7a2e-985d-d7c62a2f2273}'),
  ('019e917d-16de-7f6a-9678-82f52c8d4cb9', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917d-1505-7e4b-8c46-7c080144f34c', 'org_invites_email_sender_id_entity_id_key', NULL, NULL, 'u', '{019e917d-153e-7609-8646-3f658b5be645,019e917d-1557-7c6e-a361-175ff3ac90b3,019e917d-16b7-768b-8628-495a83fb3a0d}');


SET session_replication_role TO DEFAULT;


