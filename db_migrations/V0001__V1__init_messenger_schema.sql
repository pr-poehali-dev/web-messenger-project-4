
CREATE TABLE IF NOT EXISTS t_p14500211_web_messenger_projec.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  avatar_initials TEXT NOT NULL DEFAULT 'AA',
  avatar_color TEXT NOT NULL DEFAULT '#a855f7',
  password_hash TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'online',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p14500211_web_messenger_projec.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES t_p14500211_web_messenger_projec.users(id),
  token TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '30 days'
);

CREATE TABLE IF NOT EXISTS t_p14500211_web_messenger_projec.chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  is_group BOOLEAN NOT NULL DEFAULT FALSE,
  avatar TEXT,
  color TEXT NOT NULL DEFAULT '#a855f7',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p14500211_web_messenger_projec.chat_members (
  chat_id UUID NOT NULL REFERENCES t_p14500211_web_messenger_projec.chats(id),
  user_id UUID NOT NULL REFERENCES t_p14500211_web_messenger_projec.users(id),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (chat_id, user_id)
);

CREATE TABLE IF NOT EXISTS t_p14500211_web_messenger_projec.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL REFERENCES t_p14500211_web_messenger_projec.chats(id),
  sender_id UUID NOT NULL REFERENCES t_p14500211_web_messenger_projec.users(id),
  text TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'sent',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p14500211_web_messenger_projec.reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES t_p14500211_web_messenger_projec.messages(id),
  user_id UUID NOT NULL REFERENCES t_p14500211_web_messenger_projec.users(id),
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (message_id, user_id, emoji)
);

CREATE TABLE IF NOT EXISTS t_p14500211_web_messenger_projec.contacts (
  user_id UUID NOT NULL REFERENCES t_p14500211_web_messenger_projec.users(id),
  contact_id UUID NOT NULL REFERENCES t_p14500211_web_messenger_projec.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, contact_id)
);

CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON t_p14500211_web_messenger_projec.messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON t_p14500211_web_messenger_projec.messages(created_at);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON t_p14500211_web_messenger_projec.sessions(token);
CREATE INDEX IF NOT EXISTS idx_chat_members_user_id ON t_p14500211_web_messenger_projec.chat_members(user_id);
