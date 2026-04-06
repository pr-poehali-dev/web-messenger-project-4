"""
Чаты: получение списка, создание, участники.
GET / — список чатов текущего пользователя
POST / — создать чат (личный или группу)
GET /{id} — информация о чате
"""
import json
import os
import psycopg2

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p14500211_web_messenger_projec')
CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Authorization',
}

def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def get_token(event: dict) -> str | None:
    auth = event.get('headers', {}).get('X-Authorization', '')
    if auth.startswith('Bearer '):
        return auth[7:]
    return None

def get_user_by_token(cur, token: str):
    cur.execute(
        f"SELECT u.id, u.username, u.display_name, u.avatar_initials, u.avatar_color "
        f"FROM {SCHEMA}.sessions s JOIN {SCHEMA}.users u ON u.id = s.user_id "
        f"WHERE s.token = %s AND s.expires_at > NOW()",
        (token,)
    )
    return cur.fetchone()

def ok(data, status: int = 200):
    return {'statusCode': status, 'headers': {**CORS, 'Content-Type': 'application/json'}, 'body': json.dumps(data, default=str)}

def err(msg: str, status: int = 400):
    return {'statusCode': status, 'headers': {**CORS, 'Content-Type': 'application/json'}, 'body': json.dumps({'error': msg})}

def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    token = get_token(event)
    if not token:
        return err('Не авторизован', 401)

    conn = get_conn()
    cur = conn.cursor()
    try:
        user_row = get_user_by_token(cur, token)
        if not user_row:
            return err('Сессия истекла', 401)
        user_id = str(user_row[0])

        method = event.get('httpMethod', 'GET')
        params = event.get('queryStringParameters') or {}
        action = params.get('action', 'list')
        body = {}
        if event.get('body'):
            body = json.loads(event['body'])

        # GET ?action=list — список чатов
        if method == 'GET' and action == 'list':
            cur.execute(f"""
                SELECT
                    c.id, c.name, c.is_group, c.avatar, c.color, c.created_at,
                    (SELECT COUNT(*) FROM {SCHEMA}.chat_members cm2 WHERE cm2.chat_id = c.id) as members_count,
                    (SELECT m.text FROM {SCHEMA}.messages m WHERE m.chat_id = c.id ORDER BY m.created_at DESC LIMIT 1) as last_message,
                    (SELECT m.created_at FROM {SCHEMA}.messages m WHERE m.chat_id = c.id ORDER BY m.created_at DESC LIMIT 1) as last_message_at,
                    (SELECT u2.display_name FROM {SCHEMA}.chat_members cm3
                     JOIN {SCHEMA}.users u2 ON u2.id = cm3.user_id
                     WHERE cm3.chat_id = c.id AND cm3.user_id != %s LIMIT 1) as other_user_name,
                    (SELECT u2.avatar_initials FROM {SCHEMA}.chat_members cm3
                     JOIN {SCHEMA}.users u2 ON u2.id = cm3.user_id
                     WHERE cm3.chat_id = c.id AND cm3.user_id != %s LIMIT 1) as other_user_avatar,
                    (SELECT u2.avatar_color FROM {SCHEMA}.chat_members cm3
                     JOIN {SCHEMA}.users u2 ON u2.id = cm3.user_id
                     WHERE cm3.chat_id = c.id AND cm3.user_id != %s LIMIT 1) as other_user_color
                FROM {SCHEMA}.chats c
                JOIN {SCHEMA}.chat_members cm ON cm.chat_id = c.id AND cm.user_id = %s
                ORDER BY last_message_at DESC NULLS LAST
            """, (user_id, user_id, user_id, user_id))
            rows = cur.fetchall()
            chats = []
            for r in rows:
                chat_id, name, is_group, avatar, color, created_at, members_count, last_msg, last_at, other_name, other_avatar, other_color = r
                display_name = name if is_group else (other_name or 'Чат')
                display_avatar = avatar if is_group else (other_avatar or '??')
                display_color = color if is_group else (other_color or color)
                chats.append({
                    'id': str(chat_id),
                    'name': display_name,
                    'avatar': display_avatar,
                    'color': display_color,
                    'is_group': is_group,
                    'members_count': members_count,
                    'last_message': last_msg or '',
                    'last_message_at': str(last_at) if last_at else None,
                    'unread': 0,
                })
            return ok({'chats': chats})

        # POST ?action=create — создать чат
        if method == 'POST' and action == 'create':
            is_group = body.get('is_group', False)
            member_ids = body.get('member_ids', [])
            name = body.get('name', '')
            color = body.get('color', '#a855f7')

            if not member_ids:
                return err('Укажите участников чата')
            if is_group and not name:
                return err('Укажите название группы')

            # Для личного чата — проверить что такой чат уже есть
            if not is_group and len(member_ids) == 1:
                other_id = member_ids[0]
                cur.execute(f"""
                    SELECT c.id FROM {SCHEMA}.chats c
                    JOIN {SCHEMA}.chat_members cm1 ON cm1.chat_id = c.id AND cm1.user_id = %s
                    JOIN {SCHEMA}.chat_members cm2 ON cm2.chat_id = c.id AND cm2.user_id = %s
                    WHERE c.is_group = FALSE
                    LIMIT 1
                """, (user_id, other_id))
                existing = cur.fetchone()
                if existing:
                    return ok({'id': str(existing[0]), 'existing': True})

            cur.execute(
                f"INSERT INTO {SCHEMA}.chats (name, is_group, color) VALUES (%s, %s, %s) RETURNING id",
                (name or None, is_group, color)
            )
            chat_id = str(cur.fetchone()[0])

            all_members = list(set([user_id] + member_ids))
            for mid in all_members:
                cur.execute(
                    f"INSERT INTO {SCHEMA}.chat_members (chat_id, user_id) VALUES (%s, %s) ON CONFLICT DO NOTHING",
                    (chat_id, mid)
                )
            conn.commit()
            return ok({'id': chat_id}, 201)

        # GET ?action=members&chat_id=... — участники чата
        if method == 'GET' and action == 'members':
            chat_id = params.get('chat_id', '')
            cur.execute(
                f"SELECT id FROM {SCHEMA}.chat_members WHERE chat_id = %s AND user_id = %s",
                (chat_id, user_id)
            )
            if not cur.fetchone():
                return err('Нет доступа', 403)

            cur.execute(
                f"SELECT u.id, u.display_name, u.avatar_initials, u.avatar_color, u.status "
                f"FROM {SCHEMA}.chat_members cm JOIN {SCHEMA}.users u ON u.id = cm.user_id "
                f"WHERE cm.chat_id = %s",
                (chat_id,)
            )
            members = [{'id': str(r[0]), 'display_name': r[1], 'avatar_initials': r[2], 'avatar_color': r[3], 'status': r[4]} for r in cur.fetchall()]
            return ok({'members': members})

        return err('Не найдено', 404)
    finally:
        cur.close()
        conn.close()