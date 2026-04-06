"""
Сообщения: получение истории, отправка, реакции.
GET /?chat_id=... — история сообщений чата
POST / — отправить сообщение
POST /reaction — добавить/убрать реакцию
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
        f"SELECT u.id, u.display_name, u.avatar_initials, u.avatar_color "
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

        # GET ?action=list&chat_id=... — история сообщений
        if method == 'GET' and action == 'list':
            chat_id = params.get('chat_id')
            if not chat_id:
                return err('Укажите chat_id')

            cur.execute(
                f"SELECT id FROM {SCHEMA}.chat_members WHERE chat_id = %s AND user_id = %s",
                (chat_id, user_id)
            )
            if not cur.fetchone():
                return err('Нет доступа', 403)

            limit = int(params.get('limit', 50))
            offset = int(params.get('offset', 0))

            cur.execute(f"""
                SELECT
                    m.id, m.text, m.status, m.created_at,
                    u.id as sender_id, u.display_name, u.avatar_initials, u.avatar_color
                FROM {SCHEMA}.messages m
                JOIN {SCHEMA}.users u ON u.id = m.sender_id
                WHERE m.chat_id = %s
                ORDER BY m.created_at ASC
                LIMIT %s OFFSET %s
            """, (chat_id, limit, offset))
            rows = cur.fetchall()

            msg_ids = [str(r[0]) for r in rows]
            reactions_map: dict = {}
            if msg_ids:
                placeholders = ','.join(['%s'] * len(msg_ids))
                cur.execute(f"""
                    SELECT r.message_id, r.emoji, COUNT(*) as cnt,
                           BOOL_OR(r.user_id = %s) as mine
                    FROM {SCHEMA}.reactions r
                    WHERE r.message_id IN ({placeholders})
                    GROUP BY r.message_id, r.emoji
                """, [user_id] + msg_ids)
                for r in cur.fetchall():
                    mid = str(r[0])
                    if mid not in reactions_map:
                        reactions_map[mid] = []
                    reactions_map[mid].append({'emoji': r[1], 'count': r[2], 'mine': r[3]})

            messages = []
            for r in rows:
                msg_id = str(r[0])
                sender_id = str(r[4])
                messages.append({
                    'id': msg_id,
                    'text': r[1],
                    'status': r[2],
                    'time': r[3].strftime('%H:%M') if r[3] else '',
                    'created_at': str(r[3]),
                    'is_own': sender_id == user_id,
                    'sender': {
                        'id': sender_id,
                        'display_name': r[5],
                        'avatar_initials': r[6],
                        'avatar_color': r[7],
                    },
                    'reactions': reactions_map.get(msg_id, []),
                })
            return ok({'messages': messages})

        # POST ?action=send — отправить сообщение
        if method == 'POST' and action == 'send':
            chat_id = body.get('chat_id')
            text = (body.get('text') or '').strip()
            if not chat_id or not text:
                return err('Укажите chat_id и text')

            cur.execute(
                f"SELECT id FROM {SCHEMA}.chat_members WHERE chat_id = %s AND user_id = %s",
                (chat_id, user_id)
            )
            if not cur.fetchone():
                return err('Нет доступа', 403)

            cur.execute(
                f"INSERT INTO {SCHEMA}.messages (chat_id, sender_id, text) VALUES (%s, %s, %s) RETURNING id, created_at",
                (chat_id, user_id, text)
            )
            msg_id, created_at = cur.fetchone()
            conn.commit()
            return ok({
                'id': str(msg_id),
                'text': text,
                'time': created_at.strftime('%H:%M'),
                'created_at': str(created_at),
                'is_own': True,
                'status': 'sent',
                'reactions': [],
            }, 201)

        # POST ?action=reaction — добавить/убрать реакцию
        if method == 'POST' and action == 'reaction':
            message_id = body.get('message_id')
            emoji = body.get('emoji')
            if not message_id or not emoji:
                return err('Укажите message_id и emoji')

            cur.execute(
                f"SELECT id FROM {SCHEMA}.reactions WHERE message_id = %s AND user_id = %s AND emoji = %s",
                (message_id, user_id, emoji)
            )
            existing = cur.fetchone()
            if existing:
                cur.execute(
                    f"UPDATE {SCHEMA}.reactions SET emoji = emoji WHERE id = %s",
                    (str(existing[0]),)
                )
                # Remove reaction
                cur.execute(
                    f"UPDATE {SCHEMA}.reactions SET created_at = created_at WHERE id = %s",
                    (str(existing[0]),)
                )
                cur.execute(
                    f"DELETE FROM {SCHEMA}.reactions WHERE message_id = %s AND user_id = %s AND emoji = %s",
                    (message_id, user_id, emoji)
                )
                action = 'removed'
            else:
                cur.execute(
                    f"INSERT INTO {SCHEMA}.reactions (message_id, user_id, emoji) VALUES (%s, %s, %s)",
                    (message_id, user_id, emoji)
                )
                action = 'added'
            conn.commit()
            return ok({'action': action})

        return err('Не найдено', 404)
    finally:
        cur.close()
        conn.close()