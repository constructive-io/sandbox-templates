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
  ('019e8c61-4a46-7fee-bd19-74d3354628a3', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4a23-7673-9b91-1910c9553eea', 'users_username_key', NULL, NULL, 'u', '{019e8c61-4a3f-7dee-9a11-4493f059432d}'),
  ('019e8c61-4a78-704e-a197-f12c2886e619', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4a65-78b2-90d8-4740b1f7b87d', 'role_types_name_key', NULL, NULL, 'u', '{019e8c61-4a73-7974-88ba-7649da8e19e9}'),
  ('019e8c61-4af0-7d02-832e-c8f848af0902', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4aba-7c8f-bae5-da3c8761cf13', 'membership_types_name_key', NULL, NULL, 'u', '{019e8c61-4ad1-787d-b3bf-23c9f3127185}'),
  ('019e8c61-4b4b-7a52-8ae2-48d7d220c625', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4b2f-7ad3-a010-1dcc0f3134fb', 'app_permissions_name_key', NULL, NULL, 'u', '{019e8c61-4b45-71c1-85d7-1b000a10475d}'),
  ('019e8c61-4b5b-72a9-8a01-80efdee4e0e3', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4b2f-7ad3-a010-1dcc0f3134fb', 'app_permissions_bitnum_key', NULL, NULL, 'u', '{019e8c61-4b50-7963-87a8-1bacc8556467}'),
  ('019e8c61-4c2e-7095-82d4-686251cc495b', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4bd8-7d41-9d0a-f604463e89b0', 'app_limits_name_actor_id_key', NULL, NULL, 'u', '{019e8c61-4bf1-775c-a2b9-e00b614a0cce,019e8c61-4bf6-7f5e-826f-8e7cb47712b9}'),
  ('019e8c61-4c5d-78f3-bc36-4b7eca48eab4', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4c3a-791b-a4c7-3724b8d48bab', 'app_limit_defaults_name_key', NULL, NULL, 'u', '{019e8c61-4c4c-73bc-b44e-bc4ab478f05c}'),
  ('019e8c61-4d89-75f2-a79c-e9681e225c44', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4d6a-7811-b6a4-ce3ffd4a4d90', 'app_limit_credit_codes_code_key', NULL, NULL, 'u', '{019e8c61-4d80-7bb0-97aa-57bea369539e}'),
  ('019e8c61-4ded-7ad0-8d3b-b27380646b47', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4daf-76cc-9be1-46c0be7e746e', 'app_limit_credit_code_items_credit_code_id_default_limit_id_key', NULL, NULL, 'u', '{019e8c61-4dc4-75b9-91cd-d33d3ddf96ec,019e8c61-4dd0-7400-b071-d282e10afe02}'),
  ('019e8c61-4e30-77bb-bdde-45724f453fee', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4dfd-74b3-8fe3-1635a6e96a48', 'app_limit_credit_redemptions_credit_code_id_entity_id_key', NULL, NULL, 'u', '{019e8c61-4e11-7106-adbe-d3958b310867,019e8c61-4e1e-74e6-9287-0006e9bb8904}'),
  ('019e8c61-4e6e-7417-b772-570f89c5fe62', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4e46-7557-9fe4-5dbfdca44f4f', 'app_limit_caps_defaults_name_key', NULL, NULL, 'u', '{019e8c61-4e5c-7156-894a-b70ea959ee84}'),
  ('019e8c61-4ea2-7e17-aa92-b492fe1aa4f7', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4e72-7154-b244-1c6f81472aec', 'app_limit_caps_name_entity_id_key', NULL, NULL, 'u', '{019e8c61-4e86-7b24-a049-3977be93ace9,019e8c61-4e8f-74ad-adc2-8b60f5cbbfe7}'),
  ('019e8c61-4eea-79da-b24c-5f09196f0702', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4eb3-7482-8798-8375e51a49bc', 'app_limit_warnings_name_key', NULL, NULL, 'u', '{019e8c61-4ec8-7846-aa68-1c832c1c4c2b}'),
  ('019e8c61-4f24-7c39-8934-3251743d7ab0', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4eef-77a0-a8ef-d9805bab42f1', 'app_limit_warning_states_warning_id_actor_id_key', NULL, NULL, 'u', '{019e8c61-4f03-7ff3-aadd-12a89e4a2e79,019e8c61-4f10-7276-82e3-795e3c384f69}'),
  ('019e8c61-5106-7b4c-9da7-98c44ea30232', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4fc4-712d-aa74-ec2f43200cab', 'app_memberships_actor_id_key', NULL, NULL, 'u', '{019e8c61-50f9-72d8-8e3b-1662ed38d59e}'),
  ('019e8c61-53a5-721b-a9bd-922ecfb07439', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-5355-7984-b207-6afa488ec116', 'app_event_aggregates_actor_id_name_key', NULL, NULL, 'u', '{019e8c61-5375-7e3b-861d-cfa55cfadc4e,019e8c61-5388-754f-b6ac-c102565780a8}'),
  ('019e8c61-543c-7ffc-8b61-e4ace5ef2344', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-53bf-7e3f-98b4-b4f4f63097a1', 'app_event_types_name_key', NULL, NULL, 'u', '{019e8c61-53e2-74cb-886e-88df08c76e59}'),
  ('019e8c61-54b6-7473-bb13-bc56254cbe4e', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-5467-730c-adec-c4346e6f4432', 'app_levels_name_key', NULL, NULL, 'u', '{019e8c61-548a-7902-908c-18e6a6daf4ad}'),
  ('019e8c61-552b-7c19-afdc-65603042c11f', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-54d3-7677-8d3b-2c196ed62bd4', 'app_level_requirements_name_level_key', NULL, NULL, 'u', '{019e8c61-54f4-778b-a4a4-6857779e8f4b,019e8c61-5500-7076-b062-18ec36e4d377}'),
  ('019e8c61-559f-7c1e-8239-03427a2ab7da', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-5551-7fac-ac23-d57eecc4b075', 'app_level_grants_actor_id_level_name_period_start_key', NULL, NULL, 'u', '{019e8c61-5571-743a-93cb-0ae71f428a2a,019e8c61-5587-7203-a38c-fd93c0a61e86,019e8c61-5592-7008-aaa2-8355e08b9bac}'),
  ('019e8c61-5776-7f8e-854c-8d51ec590c55', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-56ef-783c-8673-192363215116', 'app_profiles_name_key', NULL, NULL, 'u', '{019e8c61-5715-74fa-bd92-01eedfececbc}'),
  ('019e8c61-577c-7ed8-b0e7-613cd91bc70d', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-56ef-783c-8673-192363215116', 'app_profiles_slug_key', NULL, NULL, 'u', '{019e8c61-5721-7231-8987-d1a02e0a3a33}'),
  ('019e8c61-57d3-77f8-b8f4-de9e67f9e8fa', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-578a-7b7a-bafa-3b0aaebd206e', 'app_profile_permissions_profile_id_permission_id_key', NULL, NULL, 'u', '{019e8c61-57ab-72e2-880c-14b2ad325055,019e8c61-57bd-731c-a69a-c53fc978f602}'),
  ('019e8c61-59ae-7ba5-ae82-94b265d749f6', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-5939-739e-9277-e6670e481724', 'app_profile_templates_name_key', NULL, NULL, 'u', '{019e8c61-5959-768b-b7a8-bba2d58e724e}'),
  ('019e8c61-59b4-77c7-aac1-5afb1200990f', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-5939-739e-9277-e6670e481724', 'app_profile_templates_slug_key', NULL, NULL, 'u', '{019e8c61-5965-77ab-9459-c4b694392194}'),
  ('019e8c61-5d5a-7da6-a68e-66836b4b8f77', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-5d29-7de0-981d-5a7f07ee34b9', 'org_permissions_name_key', NULL, NULL, 'u', '{019e8c61-5d4f-7f58-b992-2d06d8a06226}'),
  ('019e8c61-5d70-7560-9875-25777e9a5424', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-5d29-7de0-981d-5a7f07ee34b9', 'org_permissions_bitnum_key', NULL, NULL, 'u', '{019e8c61-5d62-700b-a360-2b268fb2fc3d}'),
  ('019e8c61-5eab-7d4d-89e2-425e2c59df1a', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-5e00-7e1a-8427-d7008b86d5ae', 'org_limits_name_actor_id_entity_id_key', NULL, NULL, 'u', '{019e8c61-5e24-7fc0-9992-9664d106101d,019e8c61-5e30-7f94-ab7b-01327e14d867,019e8c61-5e96-7f50-b88d-5e17011756d7}'),
  ('019e8c61-5f0b-7544-ad54-0b6681fb646f', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-5ec2-79dd-ae45-369bec5e7a4d', 'org_limit_defaults_name_key', NULL, NULL, 'u', '{019e8c61-5ee9-7cb9-94ba-2871427bb004}'),
  ('019e8c61-60b9-79b2-9c06-0a1d03a1682b', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-5ff8-7fe4-bf7a-8cc5c9613c30', 'org_limit_aggregates_name_entity_id_key', NULL, NULL, 'u', '{019e8c61-6021-765f-a4ab-02e52c9e11c5,019e8c61-602b-7f72-8555-592680eaef76}'),
  ('019e8c61-623f-7621-b872-4658f4b8773e', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-61f7-778d-be47-7ede5dbdfcbf', 'org_limit_caps_defaults_name_key', NULL, NULL, 'u', '{019e8c61-621c-7eb3-abc3-d13764923321}'),
  ('019e8c61-62a3-7906-aa4e-c5969846d256', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-6246-79b6-a317-690744b8b932', 'org_limit_caps_name_entity_id_key', NULL, NULL, 'u', '{019e8c61-6274-7e27-9713-6c030ef5050d,019e8c61-6283-7651-9aa6-30dabc81bf62}'),
  ('019e8c61-632d-7fc7-9ebb-2823f4e93707', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-62bd-7e45-85f6-37a07c1fc9dc', 'org_limit_warnings_name_entity_id_key', NULL, NULL, 'u', '{019e8c61-62e4-7365-9cc5-267aa5d2e697,019e8c61-631d-7fac-b92c-7e11e7c18c99}'),
  ('019e8c61-6399-7036-8eff-d20eb6c49df1', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-6334-7fef-8d30-a8cafaec05f7', 'org_limit_warning_states_warning_id_actor_id_entity_id_key', NULL, NULL, 'u', '{019e8c61-6354-7e18-ac61-ea8d6031fecc,019e8c61-6369-72ce-96d1-d012eaba6fef,019e8c61-6389-77e6-b991-07025d4c9e38}'),
  ('019e8c61-650b-75c7-8861-c6376ba07a01', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-640b-76c5-bdd4-6ff824e1399a', 'org_membership_defaults_entity_id_key', NULL, NULL, 'u', '{019e8c61-64f6-7867-aeb1-bc3eb8d90e97}'),
  ('019e8c61-6581-7407-912c-346f79b11373', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-6511-7bcf-9f20-33bcdcd3aae7', 'org_membership_settings_entity_id_key', NULL, NULL, 'u', '{019e8c61-656d-727b-863a-416b28386376}'),
  ('019e8c61-66e2-7fb5-8a6f-d5e372227caf', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-63ae-7d74-bf87-6db6c15e3e34', 'org_memberships_actor_id_entity_id_key', NULL, NULL, 'u', '{019e8c61-66b6-7b80-996f-d24a0fc2a1b9,019e8c61-66cc-76f8-aa82-8f0b6652e1b9}'),
  ('019e8c61-676b-7fb5-8a7b-d556d2e7c6ac', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-6707-7bc3-bd66-1f33bb4c29ff', 'org_members_actor_id_entity_id_key', NULL, NULL, 'u', '{019e8c61-6741-7345-96d2-36f20ed4b701,019e8c61-6757-74fb-a0f5-0ffecad4b464}'),
  ('019e8c61-696c-7e37-97c2-868bf6efcac9', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-690a-70a9-8174-fca6ea09deab', 'org_member_profiles_membership_id_key', NULL, NULL, 'u', '{019e8c61-6953-70bf-91b8-ee00cbceaec9}'),
  ('019e8c61-69fb-7258-a83b-7f08e3313541', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-690a-70a9-8174-fca6ea09deab', 'org_member_profiles_actor_id_entity_id_key', NULL, NULL, 'u', '{019e8c61-698e-74c1-86a7-5d433534f1dc,019e8c61-6973-78bd-b39a-30de7a8f8199}'),
  ('019e8c61-6c04-73c2-b8aa-6c899499918d', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-6b2b-7d4e-bc96-61bac654e74d', 'org_profiles_name_entity_id_key', NULL, NULL, 'u', '{019e8c61-6b5b-7551-8b67-ae3288d46b24,019e8c61-6bea-730d-9239-7607da0c3b9a}'),
  ('019e8c61-6c0d-74a9-bc6f-7afb59ca07e7', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-6b2b-7d4e-bc96-61bac654e74d', 'org_profiles_slug_entity_id_key', NULL, NULL, 'u', '{019e8c61-6b6f-79bc-9f2e-07bf06722fc0,019e8c61-6bea-730d-9239-7607da0c3b9a}'),
  ('019e8c61-6cb3-71e7-80f1-103f0f4194c6', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-6c28-7345-b0e9-281835706d68', 'org_profile_permissions_profile_id_permission_id_key', NULL, NULL, 'u', '{019e8c61-6c71-7e5b-9c24-32e81b4b3aad,019e8c61-6c93-7d59-89cc-67f4a51dd627}'),
  ('019e8c61-6f55-78bb-98d1-a24e1b3f02ec', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-6eb0-7cfc-b926-e3c23f2ff1a3', 'org_profile_templates_name_key', NULL, NULL, 'u', '{019e8c61-6ee0-738e-b5ee-c9f47e637305}'),
  ('019e8c61-6f5c-7edc-82d9-d38234c43cf3', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-6eb0-7cfc-b926-e3c23f2ff1a3', 'org_profile_templates_slug_key', NULL, NULL, 'u', '{019e8c61-6ef0-7a0c-9c69-90d69128ba2d}'),
  ('019e8c61-713b-743c-a394-3655590eab4d', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-7091-718e-ac95-1725d47ff3b8', 'org_event_aggregates_actor_id_name_entity_id_key', NULL, NULL, 'u', '{019e8c61-70c0-7a75-87a2-b153f0d0382f,019e8c61-70dd-755b-ae00-ad26de6a0a6a,019e8c61-7111-77dd-840b-f3d9dc6b1f27}'),
  ('019e8c61-7240-7b8c-acb3-a4311e4d39d2', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-716c-73c2-b358-28000c37fdc9', 'org_event_types_name_entity_id_key', NULL, NULL, 'u', '{019e8c61-719b-7fce-a124-da4d1d7e3606,019e8c61-722b-7c66-9925-525adab8778e}'),
  ('019e8c61-7314-7d10-ae33-ac9963d591af', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-7274-7d04-b498-89d146b1467c', 'org_levels_name_entity_id_key', NULL, NULL, 'u', '{019e8c61-72aa-751c-9cb7-c6ea9479534e,019e8c61-72ff-739c-974f-78a6abfbe983}'),
  ('019e8c61-73ec-74af-b67b-1ecbeb5767cb', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-7348-70b8-89dc-676ca5c385c2', 'org_level_requirements_name_level_entity_id_key', NULL, NULL, 'u', '{019e8c61-737d-7eb4-8569-a67703453bb9,019e8c61-7391-7da6-8f74-b10e8f854f0c,019e8c61-73d9-75b6-8ad2-de0b2d34d40d}'),
  ('019e8c61-74be-7c28-97ad-e27046cea7f4', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-7433-7839-96cb-13e23adcfe1d', 'org_level_grants_actor_id_level_name_period_start_entity_id_key', NULL, NULL, 'u', '{019e8c61-7466-7bd7-a397-3da6cdc57f08,019e8c61-7485-7f58-981b-3c4fd4786779,019e8c61-7497-78b0-a056-09b8eb0a84ad,019e8c61-74ab-7fe6-897b-31a7d2ef8c26}'),
  ('019e8c61-7c29-75b0-b8e2-7c92dc366a84', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-7b69-7ed3-8dfd-8abcfae0b66c', 'org_chart_edges_entity_id_child_id_key', NULL, NULL, 'u', '{019e8c61-7bc5-7deb-8b09-972e2b096254,019e8c61-7be0-7aff-9c9d-5ebc494ce462}'),
  ('019e8c61-7f31-7985-83a0-d4f17e4eb2ea', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-7ec6-7a83-98aa-428b7ce62047', 'user_states_owner_id_name_key', NULL, NULL, 'u', '{019e8c61-7ef6-7813-89e8-ddaa43da3e5b,019e8c61-7f07-79d4-b069-05f5ffc3138f}'),
  ('019e8c61-8218-70be-8700-5b3ec9f5d152', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-80f9-7177-a2b7-a4f11931b9e7', 'session_credentials_secret_hash_key', NULL, NULL, 'u', '{019e8c61-8161-782c-93e6-9b779a04ec08}'),
  ('019e8c61-8221-7ae0-a8a9-405ed736d660', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-80f9-7177-a2b7-a4f11931b9e7', 'session_credentials_key_id_key', NULL, NULL, 'u', '{019e8c61-8154-7409-a072-c3d0dd3c3cb5}'),
  ('019e8c61-822a-7cea-b415-592841c95d45', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-80f9-7177-a2b7-a4f11931b9e7', 'session_credentials_ot_token_key', NULL, NULL, 'u', '{019e8c61-81b4-7f3b-8975-057d1cafaa7e}'),
  ('019e8c61-887f-743b-96c1-c2e143bf3341', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-87c9-7b47-9e9a-03420e45641f', 'session_secrets_session_id_name_key', NULL, NULL, 'u', '{019e8c61-87f9-72d0-8ca1-a621ce2a59db,019e8c61-881d-754d-b35c-1995ed5a6d99}'),
  ('019e8c61-8b17-79d8-84f1-78e55013aa58', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-8a3e-7402-bd69-608d4353836e', 'auth_ip_rate_limits_ip_address_ua_hash_action_key', NULL, NULL, 'u', '{019e8c61-8a6f-78c7-8dd1-7ef1469c4d95,019e8c61-8a85-7aab-883e-689aad616215,019e8c61-8aa2-72b9-98a6-7356ac571447}'),
  ('019e8c61-8bff-7740-a567-5acd4ccab8ef', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-8b2e-7907-9377-1e7220947ae7', 'auth_rate_limits_subject_id_action_key', NULL, NULL, 'u', '{019e8c61-8b5f-7d68-ba16-2631a72fc7e8,019e8c61-8b74-77f3-a496-ceecda2c90bc}'),
  ('019e8c61-8d9b-7ec4-9f09-e0b419b752e0', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-8cb0-74c5-9efd-666ced7f5792', 'app_namespaces_name_key', NULL, NULL, 'u', '{019e8c61-8d10-7dbc-94ee-a0da005ad0fe}'),
  ('019e8c61-8da6-794c-a74e-eaf27d8b0167', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-8cb0-74c5-9efd-666ced7f5792', 'app_namespaces_namespace_name_key', NULL, NULL, 'u', '{019e8c61-8d25-7fd2-890c-45cd41b00d55}'),
  ('019e8c61-9109-77e6-91eb-a8ac2209f78e', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-905b-754a-9ac3-7235f1eca9fc', 'user_secrets_owner_id_name_key', NULL, NULL, 'u', '{019e8c61-908d-7243-85b3-2405afc6b9ac,019e8c61-90a2-7c19-9e6f-b441752d0718}'),
  ('019e8c61-9337-75ce-ba32-7257baf3f46b', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-91df-7216-a942-eecfef8d79d7', 'app_secrets_namespace_id_name_key', NULL, NULL, 'u', '{019e8c61-9232-765a-b9ee-ae94889e6573,019e8c61-9254-7bbd-aeb4-c401a955a2a2}'),
  ('019e8c61-94e4-769c-baf4-4794a7f21ec5', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-93c1-7e0a-a54f-444d8300cfa6', 'app_configs_namespace_id_name_key', NULL, NULL, 'u', '{019e8c61-93f8-77a4-91ed-e936a128a6d2,019e8c61-941b-72be-bfcd-f7fe39d0e0e0}'),
  ('019e8c61-95b4-788e-82a0-98a02cde78d9', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-9531-7d66-8c4b-a8120d03a5a6', 'app_config_definitions_name_key', NULL, NULL, 'u', '{019e8c61-959b-7927-92e9-f3647797ee5a}'),
  ('019e8c61-98cd-7739-9f10-60ac65f79a21', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-97f3-7e65-b577-738d989cde95', 'emails_email_key', NULL, NULL, 'u', '{019e8c61-9861-71ae-83fa-a9d974031698}'),
  ('019e8c61-9bce-7d2c-8be1-ad09291510dd', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-9a34-748a-acf4-fb0ded800aa4', 'app_invites_invite_token_key', NULL, NULL, 'u', '{019e8c61-9abb-76b9-a46a-8c5347c8ec66}'),
  ('019e8c61-9bda-7b48-aebb-cbf6651ebf6c', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-9a34-748a-acf4-fb0ded800aa4', 'app_invites_email_sender_id_key', NULL, NULL, 'u', '{019e8c61-9a84-7712-9b00-13369bdc18b3,019e8c61-9a9e-7b15-9cbf-b3daeff2a2f8}'),
  ('019e8c61-9f57-7c2a-a32c-4895621a1d1a', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-9d8b-7dc6-bb27-bb4cc5eea780', 'org_invites_invite_token_key', NULL, NULL, 'u', '{019e8c61-9e18-767a-8bae-ed8142af6f3d}'),
  ('019e8c61-9f87-74d4-8657-5d29efa5f69f', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-9d8b-7dc6-bb27-bb4cc5eea780', 'org_invites_email_sender_id_entity_id_key', NULL, NULL, 'u', '{019e8c61-9dd4-70f4-9fff-96b4b2d6a31b,019e8c61-9dec-7c64-aa5e-c3f2b22e89c5,019e8c61-9f63-725d-81a9-97dddb9c64a2}');


SET session_replication_role TO DEFAULT;


