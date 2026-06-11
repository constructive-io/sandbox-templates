-- Deploy: migrate/check_constraint
-- made with <3 @ constructive.io

-- requires: migrate/unique_constraint


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

INSERT INTO metaschema_public.check_constraint (
  id,
  database_id,
  table_id,
  name,
  type,
  field_ids,
  expr,
  smart_tags,
  category,
  module,
  scope,
  tags,
  created_at,
  updated_at
) VALUES
  ('019eaaf4-aa27-7eeb-ada5-e50fe892a315', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-aa0c-7194-9321-949d0e7e42bc', 'users_username_chk', 'c', '{019eaaf4-aa25-70e4-a524-329edc21e274}', '{"A_Expr":{"kind":"AEXPR_OP","name":[{"String":{"sval":"<="}}],"lexpr":{"FuncCall":{"args":[{"ColumnRef":{"fields":[{"String":{"sval":"username"}}]}}],"funcname":[{"String":{"sval":"character_length"}}]}},"rexpr":{"A_Const":{"ival":256}}}}', NULL, 'app', NULL, NULL, '{}', '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-aa31-7d14-be4c-0d1c0a7bdba7', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-aa0c-7194-9321-949d0e7e42bc', 'users_display_name_chk', 'c', '{019eaaf4-aa2f-7b68-ba8e-0188e22cde39}', '{"A_Expr":{"kind":"AEXPR_OP","name":[{"String":{"sval":"<="}}],"lexpr":{"FuncCall":{"args":[{"ColumnRef":{"fields":[{"String":{"sval":"display_name"}}]}}],"funcname":[{"String":{"sval":"character_length"}}]}},"rexpr":{"A_Const":{"ival":256}}}}', NULL, 'app', NULL, NULL, '{}', '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-ab2c-731a-b247-cad63949f8b1', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-ab0b-7f32-8677-f03c0acae6ae', 'app_permissions_bitnum_chk', 'c', '{019eaaf4-ab29-7a5e-8eb2-bd362a2ad345}', '{"BoolExpr":{"args":[{"A_Expr":{"kind":"AEXPR_OP","name":[{"String":{"sval":">="}}],"lexpr":{"ColumnRef":{"fields":[{"String":{"sval":"bitnum"}}]}},"rexpr":{"A_Const":{"ival":1}}}},{"A_Expr":{"kind":"AEXPR_OP","name":[{"String":{"sval":"<="}}],"lexpr":{"ColumnRef":{"fields":[{"String":{"sval":"bitnum"}}]}},"rexpr":{"A_Const":{"ival":64}}}}],"boolop":"AND_EXPR"}}', NULL, 'app', NULL, NULL, '{}', '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-bcfd-738a-af2d-c9d0fe777855', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-bcc7-7c33-8037-c1bae05cfb99', 'org_permissions_bitnum_chk', 'c', '{019eaaf4-bcf9-7266-8d21-94ce0dd85fae}', '{"BoolExpr":{"args":[{"A_Expr":{"kind":"AEXPR_OP","name":[{"String":{"sval":">="}}],"lexpr":{"ColumnRef":{"fields":[{"String":{"sval":"bitnum"}}]}},"rexpr":{"A_Const":{"ival":1}}}},{"A_Expr":{"kind":"AEXPR_OP","name":[{"String":{"sval":"<="}}],"lexpr":{"ColumnRef":{"fields":[{"String":{"sval":"bitnum"}}]}},"rexpr":{"A_Const":{"ival":64}}}}],"boolop":"AND_EXPR"}}', NULL, 'app', NULL, NULL, '{}', '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-dbdd-741e-aac7-d90e1e2d172f', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-db0d-7dbc-a79a-37bea68e09ad', 'org_chart_edges_child_id_parent_id_chk', 'c', '{019eaaf4-db7c-7b20-9712-57be40a3de38,019eaaf4-db94-7c57-9e07-aa2e7611996d}', '{"A_Expr":{"kind":"AEXPR_OP","name":[{"String":{"sval":"<>"}}],"lexpr":{"ColumnRef":{"fields":[{"String":{"sval":"child_id"}}]}},"rexpr":{"ColumnRef":{"fields":[{"String":{"sval":"parent_id"}}]}}}}', NULL, 'app', NULL, NULL, '{}', '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-ee64-7859-965b-c6f26e11668e', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-ed6b-707a-8b27-b7e715b55500', 'app_namespace_events_event_type_chk', 'c', '{019eaaf4-edba-7973-8d73-25e569aa9d30}', '{"A_Expr":{"kind":"AEXPR_IN","name":[{"String":{"sval":"="}}],"lexpr":{"ColumnRef":{"fields":[{"String":{"sval":"event_type"}}]}},"rexpr":[{"A_Const":{"sval":"created"}},{"A_Const":{"sval":"activated"}},{"A_Const":{"sval":"deactivated"}},{"A_Const":{"sval":"labels_updated"}},{"A_Const":{"sval":"annotations_updated"}},{"A_Const":{"sval":"renamed"}},{"A_Const":{"sval":"deleted"}},{"A_Const":{"sval":"metrics_snapshot"}},{"A_Const":{"sval":"scaled"}},{"A_Const":{"sval":"quota_exceeded"}},{"A_Const":{"sval":"resource_warning"}}]}}', NULL, 'app', NULL, NULL, '{}', '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-fb03-7203-8502-685e9958b792', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-f914-744b-93a6-b9b5dac62763', 'app_invites_channel_email_phone_chk', 'c', '{019eaaf4-f95c-7a49-90b3-e3bdaae591af,019eaaf4-f97d-71d7-b932-cc225b2eaaf2,019eaaf4-f993-7c27-b0c7-b967c78a4978}', '{"BoolExpr":{"args":[{"A_Expr":{"kind":"AEXPR_OP","name":[{"String":{"sval":"<>"}}],"lexpr":{"ColumnRef":{"fields":[{"String":{"sval":"channel"}}]}},"rexpr":{"A_Const":{"sval":"sms"}}}},{"NullTest":{"arg":{"ColumnRef":{"fields":[{"String":{"sval":"phone"}}]}},"nulltesttype":"IS_NOT_NULL"}}],"boolop":"OR_EXPR"}}', NULL, 'app', NULL, NULL, '{}', '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-fbf0-7695-9294-79307572576a', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-fb0b-7df1-8412-263b6e692a81', 'app_claimed_invites_sender_id_receiver_id_chk', 'c', '{019eaaf4-fb5f-75f8-be66-a8ee4e6c720e,019eaaf4-fb6d-77f2-92fd-a38406031523}', '{"A_Expr":{"kind":"AEXPR_OP","name":[{"String":{"sval":"<>"}}],"lexpr":{"ColumnRef":{"fields":[{"String":{"sval":"sender_id"}}]}},"rexpr":{"ColumnRef":{"fields":[{"String":{"sval":"receiver_id"}}]}}}}', NULL, 'app', NULL, NULL, '{}', '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-fef8-74a2-b857-72e85a52faf4', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-fca1-7bc7-a122-ac1da00293f7', 'org_invites_channel_email_phone_chk', 'c', '{019eaaf4-fced-71aa-9638-52875f64b382,019eaaf4-fd0d-7814-a82c-74e4a6a236a8,019eaaf4-fd22-7bdf-8ff1-3c001518cb53}', '{"BoolExpr":{"args":[{"A_Expr":{"kind":"AEXPR_OP","name":[{"String":{"sval":"<>"}}],"lexpr":{"ColumnRef":{"fields":[{"String":{"sval":"channel"}}]}},"rexpr":{"A_Const":{"sval":"sms"}}}},{"NullTest":{"arg":{"ColumnRef":{"fields":[{"String":{"sval":"phone"}}]}},"nulltesttype":"IS_NOT_NULL"}}],"boolop":"OR_EXPR"}}', NULL, 'app', NULL, NULL, '{}', '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z'),
  ('019eaaf4-ffc6-7b53-8345-1269dc1090d3', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-ff00-7e67-b14b-c601e2769df3', 'org_claimed_invites_sender_id_receiver_id_chk', 'c', '{019eaaf4-ff55-70c5-a61d-b433e8d04fb8,019eaaf4-ff62-7ed2-bcaf-721aa1005cc7}', '{"A_Expr":{"kind":"AEXPR_OP","name":[{"String":{"sval":"<>"}}],"lexpr":{"ColumnRef":{"fields":[{"String":{"sval":"sender_id"}}]}},"rexpr":{"ColumnRef":{"fields":[{"String":{"sval":"receiver_id"}}]}}}}', NULL, 'app', NULL, NULL, '{}', '2026-06-09T05:57:01.000Z', '2026-06-09T05:57:01.000Z');


SET session_replication_role TO DEFAULT;


