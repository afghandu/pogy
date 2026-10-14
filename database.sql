BEGIN;

CREATE TABLE IF NOT EXISTS pogy_afk (
  id TEXT PRIMARY KEY,
  document JSONB NOT NULL CHECK (jsonb_typeof(document) = 'object')
);
CREATE INDEX IF NOT EXISTS pogy_afk_document_gin_idx ON pogy_afk USING GIN (document jsonb_path_ops);

CREATE TABLE IF NOT EXISTS pogy_alt_detector (
  id TEXT PRIMARY KEY,
  document JSONB NOT NULL CHECK (jsonb_typeof(document) = 'object')
);
CREATE INDEX IF NOT EXISTS pogy_alt_detector_document_gin_idx ON pogy_alt_detector USING GIN (document jsonb_path_ops);
CREATE UNIQUE INDEX IF NOT EXISTS pogy_alt_detector_guildid_uidx ON pogy_alt_detector ((document ->> 'guildID')) WHERE document -> 'guildID' IS NOT NULL;
ALTER TABLE pogy_alt_detector DROP CONSTRAINT IF EXISTS pogy_alt_detector_required_chk;
ALTER TABLE pogy_alt_detector ADD CONSTRAINT pogy_alt_detector_required_chk CHECK (document -> 'guildID' IS NOT NULL AND document -> 'guildID' <> 'null'::jsonb);

CREATE TABLE IF NOT EXISTS pogy_cc (
  id TEXT PRIMARY KEY,
  document JSONB NOT NULL CHECK (jsonb_typeof(document) = 'object')
);
CREATE INDEX IF NOT EXISTS pogy_cc_document_gin_idx ON pogy_cc USING GIN (document jsonb_path_ops);

CREATE TABLE IF NOT EXISTS pogy_warn (
  id TEXT PRIMARY KEY,
  document JSONB NOT NULL CHECK (jsonb_typeof(document) = 'object')
);
CREATE INDEX IF NOT EXISTS pogy_warn_document_gin_idx ON pogy_warn USING GIN (document jsonb_path_ops);

CREATE TABLE IF NOT EXISTS pogy_mute (
  id TEXT PRIMARY KEY,
  document JSONB NOT NULL CHECK (jsonb_typeof(document) = 'object')
);
CREATE INDEX IF NOT EXISTS pogy_mute_document_gin_idx ON pogy_mute USING GIN (document jsonb_path_ops);

CREATE TABLE IF NOT EXISTS pogy_eco_rob (
  id TEXT PRIMARY KEY,
  document JSONB NOT NULL CHECK (jsonb_typeof(document) = 'object')
);
CREATE INDEX IF NOT EXISTS pogy_eco_rob_document_gin_idx ON pogy_eco_rob USING GIN (document jsonb_path_ops);

CREATE TABLE IF NOT EXISTS pogy_short_url (
  id TEXT PRIMARY KEY,
  document JSONB NOT NULL CHECK (jsonb_typeof(document) = 'object')
);
CREATE INDEX IF NOT EXISTS pogy_short_url_document_gin_idx ON pogy_short_url USING GIN (document jsonb_path_ops);
ALTER TABLE pogy_short_url DROP CONSTRAINT IF EXISTS pogy_short_url_required_chk;
ALTER TABLE pogy_short_url ADD CONSTRAINT pogy_short_url_required_chk CHECK (document ?& ARRAY['full', 'short', 'clicks'] AND document -> 'full' <> 'null'::jsonb AND document -> 'short' <> 'null'::jsonb AND document -> 'clicks' <> 'null'::jsonb);

CREATE TABLE IF NOT EXISTS pogy_ticket_schema (
  id TEXT PRIMARY KEY,
  document JSONB NOT NULL CHECK (jsonb_typeof(document) = 'object')
);
CREATE INDEX IF NOT EXISTS pogy_ticket_schema_document_gin_idx ON pogy_ticket_schema USING GIN (document jsonb_path_ops);

CREATE TABLE IF NOT EXISTS pogy_paste (
  id TEXT PRIMARY KEY,
  document JSONB NOT NULL CHECK (jsonb_typeof(document) = 'object')
);
CREATE INDEX IF NOT EXISTS pogy_paste_document_gin_idx ON pogy_paste USING GIN (document jsonb_path_ops);
DROP INDEX IF EXISTS pogy_paste_expiresat_idx;
CREATE INDEX pogy_paste_expiresat_idx ON pogy_paste ((document ->> 'expiresAt')) WHERE document ->> 'expiresAt' IS NOT NULL;

CREATE TABLE IF NOT EXISTS pogy_auto_response (
  id TEXT PRIMARY KEY,
  document JSONB NOT NULL CHECK (jsonb_typeof(document) = 'object')
);
CREATE INDEX IF NOT EXISTS pogy_auto_response_document_gin_idx ON pogy_auto_response USING GIN (document jsonb_path_ops);
ALTER TABLE pogy_auto_response DROP CONSTRAINT IF EXISTS pogy_auto_response_required_chk;
ALTER TABLE pogy_auto_response ADD CONSTRAINT pogy_auto_response_required_chk CHECK (document ?& ARRAY['guildId', 'name', 'content'] AND document -> 'guildId' <> 'null'::jsonb AND document -> 'name' <> 'null'::jsonb AND document -> 'content' <> 'null'::jsonb);

CREATE TABLE IF NOT EXISTS pogy_blacklist (
  id TEXT PRIMARY KEY,
  document JSONB NOT NULL CHECK (jsonb_typeof(document) = 'object')
);
CREATE INDEX IF NOT EXISTS pogy_blacklist_document_gin_idx ON pogy_blacklist USING GIN (document jsonb_path_ops);
ALTER TABLE pogy_blacklist DROP CONSTRAINT IF EXISTS pogy_blacklist_required_chk;
ALTER TABLE pogy_blacklist ADD CONSTRAINT pogy_blacklist_required_chk CHECK (document -> 'type' IS NOT NULL AND document -> 'type' <> 'null'::jsonb);

CREATE TABLE IF NOT EXISTS pogy_custom_command (
  id TEXT PRIMARY KEY,
  document JSONB NOT NULL CHECK (jsonb_typeof(document) = 'object')
);
CREATE INDEX IF NOT EXISTS pogy_custom_command_document_gin_idx ON pogy_custom_command USING GIN (document jsonb_path_ops);
ALTER TABLE pogy_custom_command DROP CONSTRAINT IF EXISTS pogy_custom_command_required_chk;
ALTER TABLE pogy_custom_command ADD CONSTRAINT pogy_custom_command_required_chk CHECK (document ?& ARRAY['guildId', 'name', 'content'] AND document -> 'guildId' <> 'null'::jsonb AND document -> 'name' <> 'null'::jsonb AND document -> 'content' <> 'null'::jsonb);

CREATE TABLE IF NOT EXISTS pogy_edit_snipe (
  id TEXT PRIMARY KEY,
  document JSONB NOT NULL CHECK (jsonb_typeof(document) = 'object')
);
CREATE INDEX IF NOT EXISTS pogy_edit_snipe_document_gin_idx ON pogy_edit_snipe USING GIN (document jsonb_path_ops);

CREATE TABLE IF NOT EXISTS pogy_guild (
  id TEXT PRIMARY KEY,
  document JSONB NOT NULL CHECK (jsonb_typeof(document) = 'object')
);
CREATE INDEX IF NOT EXISTS pogy_guild_document_gin_idx ON pogy_guild USING GIN (document jsonb_path_ops);
CREATE UNIQUE INDEX IF NOT EXISTS pogy_guild_guildid_uidx ON pogy_guild ((document ->> 'guildId')) WHERE document -> 'guildId' IS NOT NULL;
ALTER TABLE pogy_guild DROP CONSTRAINT IF EXISTS pogy_guild_required_chk;
ALTER TABLE pogy_guild ADD CONSTRAINT pogy_guild_required_chk CHECK (document ?& ARRAY['guildId', 'prefix'] AND document -> 'guildId' <> 'null'::jsonb AND document -> 'prefix' <> 'null'::jsonb);

CREATE TABLE IF NOT EXISTS pogy_premium_guild (
  id TEXT PRIMARY KEY,
  document JSONB NOT NULL CHECK (jsonb_typeof(document) = 'object')
);
CREATE INDEX IF NOT EXISTS pogy_premium_guild_document_gin_idx ON pogy_premium_guild USING GIN (document jsonb_path_ops);

CREATE TABLE IF NOT EXISTS pogy_leave (
  id TEXT PRIMARY KEY,
  document JSONB NOT NULL CHECK (jsonb_typeof(document) = 'object')
);
CREATE INDEX IF NOT EXISTS pogy_leave_document_gin_idx ON pogy_leave USING GIN (document jsonb_path_ops);
CREATE UNIQUE INDEX IF NOT EXISTS pogy_leave_guildid_uidx ON pogy_leave ((document ->> 'guildId')) WHERE document -> 'guildId' IS NOT NULL;
ALTER TABLE pogy_leave DROP CONSTRAINT IF EXISTS pogy_leave_required_chk;
ALTER TABLE pogy_leave ADD CONSTRAINT pogy_leave_required_chk CHECK (document -> 'guildId' IS NOT NULL AND document -> 'guildId' <> 'null'::jsonb);

CREATE TABLE IF NOT EXISTS pogy_logging (
  id TEXT PRIMARY KEY,
  document JSONB NOT NULL CHECK (jsonb_typeof(document) = 'object')
);
CREATE INDEX IF NOT EXISTS pogy_logging_document_gin_idx ON pogy_logging USING GIN (document jsonb_path_ops);
CREATE UNIQUE INDEX IF NOT EXISTS pogy_logging_guildid_uidx ON pogy_logging ((document ->> 'guildId')) WHERE document -> 'guildId' IS NOT NULL;
ALTER TABLE pogy_logging DROP CONSTRAINT IF EXISTS pogy_logging_required_chk;
ALTER TABLE pogy_logging ADD CONSTRAINT pogy_logging_required_chk CHECK (document -> 'guildId' IS NOT NULL AND document -> 'guildId' <> 'null'::jsonb);

CREATE TABLE IF NOT EXISTS pogy_maintenance (
  id TEXT PRIMARY KEY,
  document JSONB NOT NULL CHECK (jsonb_typeof(document) = 'object')
);
CREATE INDEX IF NOT EXISTS pogy_maintenance_document_gin_idx ON pogy_maintenance USING GIN (document jsonb_path_ops);

CREATE TABLE IF NOT EXISTS pogy_nickname (
  id TEXT PRIMARY KEY,
  document JSONB NOT NULL CHECK (jsonb_typeof(document) = 'object')
);
CREATE INDEX IF NOT EXISTS pogy_nickname_document_gin_idx ON pogy_nickname USING GIN (document jsonb_path_ops);
ALTER TABLE pogy_nickname DROP CONSTRAINT IF EXISTS pogy_nickname_required_chk;
ALTER TABLE pogy_nickname ADD CONSTRAINT pogy_nickname_required_chk CHECK (document ?& ARRAY['discordId', 'guildId'] AND document -> 'discordId' <> 'null'::jsonb AND document -> 'guildId' <> 'null'::jsonb);

CREATE TABLE IF NOT EXISTS pogy_pogy_news (
  id TEXT PRIMARY KEY,
  document JSONB NOT NULL CHECK (jsonb_typeof(document) = 'object')
);
CREATE INDEX IF NOT EXISTS pogy_pogy_news_document_gin_idx ON pogy_pogy_news USING GIN (document jsonb_path_ops);
ALTER TABLE pogy_pogy_news DROP CONSTRAINT IF EXISTS pogy_pogy_news_required_chk;
ALTER TABLE pogy_pogy_news ADD CONSTRAINT pogy_pogy_news_required_chk CHECK (document ?& ARRAY['news', 'time'] AND document -> 'news' <> 'null'::jsonb AND document -> 'time' <> 'null'::jsonb);

CREATE TABLE IF NOT EXISTS pogy_snipe (
  id TEXT PRIMARY KEY,
  document JSONB NOT NULL CHECK (jsonb_typeof(document) = 'object')
);
CREATE INDEX IF NOT EXISTS pogy_snipe_document_gin_idx ON pogy_snipe USING GIN (document jsonb_path_ops);

CREATE TABLE IF NOT EXISTS pogy_sticky (
  id TEXT PRIMARY KEY,
  document JSONB NOT NULL CHECK (jsonb_typeof(document) = 'object')
);
CREATE INDEX IF NOT EXISTS pogy_sticky_document_gin_idx ON pogy_sticky USING GIN (document jsonb_path_ops);
CREATE UNIQUE INDEX IF NOT EXISTS pogy_sticky_guildid_uidx ON pogy_sticky ((document ->> 'guildId')) WHERE document -> 'guildId' IS NOT NULL;
ALTER TABLE pogy_sticky DROP CONSTRAINT IF EXISTS pogy_sticky_required_chk;
ALTER TABLE pogy_sticky ADD CONSTRAINT pogy_sticky_required_chk CHECK (document -> 'guildId' IS NOT NULL AND document -> 'guildId' <> 'null'::jsonb);

CREATE TABLE IF NOT EXISTS pogy_temp_vc (
  id TEXT PRIMARY KEY,
  document JSONB NOT NULL CHECK (jsonb_typeof(document) = 'object')
);
CREATE INDEX IF NOT EXISTS pogy_temp_vc_document_gin_idx ON pogy_temp_vc USING GIN (document jsonb_path_ops);
CREATE UNIQUE INDEX IF NOT EXISTS pogy_temp_vc_guildid_uidx ON pogy_temp_vc ((document ->> 'guildId')) WHERE document -> 'guildId' IS NOT NULL;
ALTER TABLE pogy_temp_vc DROP CONSTRAINT IF EXISTS pogy_temp_vc_required_chk;
ALTER TABLE pogy_temp_vc ADD CONSTRAINT pogy_temp_vc_required_chk CHECK (document -> 'guildId' IS NOT NULL AND document -> 'guildId' <> 'null'::jsonb);

CREATE TABLE IF NOT EXISTS pogy_user (
  id TEXT PRIMARY KEY,
  document JSONB NOT NULL CHECK (jsonb_typeof(document) = 'object')
);
CREATE INDEX IF NOT EXISTS pogy_user_document_gin_idx ON pogy_user USING GIN (document jsonb_path_ops);
CREATE UNIQUE INDEX IF NOT EXISTS pogy_user_discordid_uidx ON pogy_user ((document ->> 'discordId')) WHERE document -> 'discordId' IS NOT NULL;
ALTER TABLE pogy_user DROP CONSTRAINT IF EXISTS pogy_user_required_chk;
ALTER TABLE pogy_user ADD CONSTRAINT pogy_user_required_chk CHECK (document -> 'discordId' IS NOT NULL AND document -> 'discordId' <> 'null'::jsonb);

CREATE TABLE IF NOT EXISTS pogy_username (
  id TEXT PRIMARY KEY,
  document JSONB NOT NULL CHECK (jsonb_typeof(document) = 'object')
);
CREATE INDEX IF NOT EXISTS pogy_username_document_gin_idx ON pogy_username USING GIN (document jsonb_path_ops);
ALTER TABLE pogy_username DROP CONSTRAINT IF EXISTS pogy_username_required_chk;
ALTER TABLE pogy_username ADD CONSTRAINT pogy_username_required_chk CHECK (document -> 'discordId' IS NOT NULL AND document -> 'discordId' <> 'null'::jsonb);

CREATE TABLE IF NOT EXISTS pogy_welcome_module (
  id TEXT PRIMARY KEY,
  document JSONB NOT NULL CHECK (jsonb_typeof(document) = 'object')
);
CREATE INDEX IF NOT EXISTS pogy_welcome_module_document_gin_idx ON pogy_welcome_module USING GIN (document jsonb_path_ops);
CREATE UNIQUE INDEX IF NOT EXISTS pogy_welcome_module_guildid_uidx ON pogy_welcome_module ((document ->> 'guildId')) WHERE document -> 'guildId' IS NOT NULL;
ALTER TABLE pogy_welcome_module DROP CONSTRAINT IF EXISTS pogy_welcome_module_required_chk;
ALTER TABLE pogy_welcome_module ADD CONSTRAINT pogy_welcome_module_required_chk CHECK (document -> 'guildId' IS NOT NULL AND document -> 'guildId' <> 'null'::jsonb);

CREATE TABLE IF NOT EXISTS pogy_app_id (
  id TEXT PRIMARY KEY,
  document JSONB NOT NULL CHECK (jsonb_typeof(document) = 'object')
);
CREATE INDEX IF NOT EXISTS pogy_app_id_document_gin_idx ON pogy_app_id USING GIN (document jsonb_path_ops);

CREATE TABLE IF NOT EXISTS pogy_app (
  id TEXT PRIMARY KEY,
  document JSONB NOT NULL CHECK (jsonb_typeof(document) = 'object')
);
CREATE INDEX IF NOT EXISTS pogy_app_document_gin_idx ON pogy_app USING GIN (document jsonb_path_ops);

CREATE TABLE IF NOT EXISTS pogy_applied (
  id TEXT PRIMARY KEY,
  document JSONB NOT NULL CHECK (jsonb_typeof(document) = 'object')
);
CREATE INDEX IF NOT EXISTS pogy_applied_document_gin_idx ON pogy_applied USING GIN (document jsonb_path_ops);

CREATE TABLE IF NOT EXISTS pogy_ecoanimal (
  id TEXT PRIMARY KEY,
  document JSONB NOT NULL CHECK (jsonb_typeof(document) = 'object')
);
CREATE INDEX IF NOT EXISTS pogy_ecoanimal_document_gin_idx ON pogy_ecoanimal USING GIN (document jsonb_path_ops);

CREATE TABLE IF NOT EXISTS pogy_balance (
  id TEXT PRIMARY KEY,
  document JSONB NOT NULL CHECK (jsonb_typeof(document) = 'object')
);
CREATE INDEX IF NOT EXISTS pogy_balance_document_gin_idx ON pogy_balance USING GIN (document jsonb_path_ops);

CREATE TABLE IF NOT EXISTS pogy_equipped_item (
  id TEXT PRIMARY KEY,
  document JSONB NOT NULL CHECK (jsonb_typeof(document) = 'object')
);
CREATE INDEX IF NOT EXISTS pogy_equipped_item_document_gin_idx ON pogy_equipped_item USING GIN (document jsonb_path_ops);
ALTER TABLE pogy_equipped_item DROP CONSTRAINT IF EXISTS pogy_equipped_item_required_chk;
ALTER TABLE pogy_equipped_item ADD CONSTRAINT pogy_equipped_item_required_chk CHECK (document -> 'user' IS NOT NULL AND document -> 'user' <> 'null'::jsonb);

CREATE TABLE IF NOT EXISTS pogy_ecoitems (
  id TEXT PRIMARY KEY,
  document JSONB NOT NULL CHECK (jsonb_typeof(document) = 'object')
);
CREATE INDEX IF NOT EXISTS pogy_ecoitems_document_gin_idx ON pogy_ecoitems USING GIN (document jsonb_path_ops);

CREATE TABLE IF NOT EXISTS pogy_reaction (
  id TEXT PRIMARY KEY,
  document JSONB NOT NULL CHECK (jsonb_typeof(document) = 'object')
);
CREATE INDEX IF NOT EXISTS pogy_reaction_document_gin_idx ON pogy_reaction USING GIN (document jsonb_path_ops);

CREATE TABLE IF NOT EXISTS "session" (
  sid VARCHAR NOT NULL PRIMARY KEY,
  sess JSON NOT NULL,
  expire TIMESTAMP(6) NOT NULL
);
CREATE INDEX IF NOT EXISTS "session_expire_idx" ON "session" (expire);

COMMIT;
