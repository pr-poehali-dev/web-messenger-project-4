"""
Пользователи: поиск, профиль.
GET /search?q=... — поиск пользователей
GET /{id} — профиль пользователя
"""
import json
import os
import psycopg2

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p14500211_web_messenger_projec')
CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
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
        f"SELECT u.id FROM {SCHEMA}.sessions s JOIN {SCHEMA}.users u ON u.id = s.user_id "
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

        params = event.get('queryStringParameters') or {}
        action = params.get('action', 'search')

        # GET ?action=search&q=...
        if action == 'search':
            q = params.get('q', '').strip()
            if len(q) < 2:
                return ok({'users': []})
            cur.execute(f"""
                SELECT id, username, display_name, avatar_initials, avatar_color, status
                FROM {SCHEMA}.users
                WHERE id != %s AND (
                    username ILIKE %s OR display_name ILIKE %s
                )
                LIMIT 20
            """, (user_id, f'%{q}%', f'%{q}%'))
            users = [{'id': str(r[0]), 'username': r[1], 'display_name': r[2], 'avatar_initials': r[3], 'avatar_color': r[4], 'status': r[5]} for r in cur.fetchall()]
            return ok({'users': users})

        # GET ?action=profile&id=...
        if action == 'profile':
            target_id = params.get('id', '')
            cur.execute(
                f"SELECT id, username, display_name, avatar_initials, avatar_color, status, last_seen_at "
                f"FROM {SCHEMA}.users WHERE id = %s",
                (target_id,)
            )
            r = cur.fetchone()
            if not r:
                return err('Пользователь не найден', 404)
            return ok({'id': str(r[0]), 'username': r[1], 'display_name': r[2], 'avatar_initials': r[3], 'avatar_color': r[4], 'status': r[5], 'last_seen_at': str(r[6])})

        return err('Не найдено', 404)
    finally:
        cur.close()
        conn.close()