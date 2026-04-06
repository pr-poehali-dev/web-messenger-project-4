"""
Авторизация: регистрация, вход, выход, проверка токена.
?action=register POST — регистрация
?action=login POST — вход
?action=logout POST — выход
?action=me GET — текущий пользователь
"""
import json
import os
import hashlib
import secrets
import psycopg2

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p14500211_web_messenger_projec')
CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Authorization',
}

def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def get_token(event: dict) -> str | None:
    auth = event.get('headers', {}).get('X-Authorization', '')
    if auth.startswith('Bearer '):
        return auth[7:]
    return None

def get_user_by_token(cur, token: str):
    cur.execute(
        f"SELECT u.id, u.username, u.display_name, u.avatar_initials, u.avatar_color, u.status "
        f"FROM {SCHEMA}.sessions s JOIN {SCHEMA}.users u ON u.id = s.user_id "
        f"WHERE s.token = %s AND s.expires_at > NOW()",
        (token,)
    )
    return cur.fetchone()

def ok(data: dict, status: int = 200):
    return {'statusCode': status, 'headers': {**CORS, 'Content-Type': 'application/json'}, 'body': json.dumps(data, default=str)}

def err(msg: str, status: int = 400):
    return {'statusCode': status, 'headers': {**CORS, 'Content-Type': 'application/json'}, 'body': json.dumps({'error': msg})}

def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    method = event.get('httpMethod', 'GET')
    params = event.get('queryStringParameters') or {}
    action = params.get('action', '')
    body = {}
    if event.get('body'):
        body = json.loads(event['body'])

    conn = get_conn()
    cur = conn.cursor()

    try:
        # Регистрация
        if action == 'register' and method == 'POST':
            username = body.get('username', '').strip().lower()
            display_name = body.get('display_name', '').strip()
            password = body.get('password', '')
            if not username or not display_name or not password:
                return err('Заполните все поля')
            if len(password) < 6:
                return err('Пароль должен быть не менее 6 символов')

            cur.execute(f"SELECT id FROM {SCHEMA}.users WHERE username = %s", (username,))
            if cur.fetchone():
                return err('Пользователь с таким именем уже существует')

            initials = ''.join(w[0].upper() for w in display_name.split()[:2])
            colors = ['#a855f7', '#00d4ff', '#f472b6', '#4ade80', '#fb923c', '#f59e0b']
            color = colors[hash(username) % len(colors)]

            cur.execute(
                f"INSERT INTO {SCHEMA}.users (username, display_name, avatar_initials, avatar_color, password_hash) "
                f"VALUES (%s, %s, %s, %s, %s) RETURNING id",
                (username, display_name, initials, color, hash_password(password))
            )
            user_id = str(cur.fetchone()[0])
            token = secrets.token_urlsafe(32)
            cur.execute(
                f"INSERT INTO {SCHEMA}.sessions (user_id, token) VALUES (%s, %s)",
                (user_id, token)
            )
            conn.commit()
            return ok({'token': token, 'user': {'id': user_id, 'username': username, 'display_name': display_name, 'avatar_initials': initials, 'avatar_color': color, 'status': 'online'}}, 201)

        # Вход
        if action == 'login' and method == 'POST':
            username = body.get('username', '').strip().lower()
            password = body.get('password', '')
            if not username or not password:
                return err('Введите имя пользователя и пароль')

            cur.execute(
                f"SELECT id, display_name, avatar_initials, avatar_color, status FROM {SCHEMA}.users "
                f"WHERE username = %s AND password_hash = %s",
                (username, hash_password(password))
            )
            row = cur.fetchone()
            if not row:
                return err('Неверное имя пользователя или пароль', 401)

            user_id, display_name, avatar_initials, avatar_color, status = row
            token = secrets.token_urlsafe(32)
            cur.execute(f"INSERT INTO {SCHEMA}.sessions (user_id, token) VALUES (%s, %s)", (str(user_id), token))
            cur.execute(f"UPDATE {SCHEMA}.users SET last_seen_at = NOW() WHERE id = %s", (str(user_id),))
            conn.commit()
            return ok({'token': token, 'user': {'id': str(user_id), 'username': username, 'display_name': display_name, 'avatar_initials': avatar_initials, 'avatar_color': avatar_color, 'status': status}})

        # Текущий пользователь
        if action == 'me' and method == 'GET':
            token = get_token(event)
            if not token:
                return err('Не авторизован', 401)
            row = get_user_by_token(cur, token)
            if not row:
                return err('Сессия истекла', 401)
            uid, username, display_name, avatar_initials, avatar_color, status = row
            return ok({'id': str(uid), 'username': username, 'display_name': display_name, 'avatar_initials': avatar_initials, 'avatar_color': avatar_color, 'status': status})

        # Выход
        if action == 'logout' and method == 'POST':
            token = get_token(event)
            if token:
                cur.execute(f"UPDATE {SCHEMA}.sessions SET expires_at = NOW() WHERE token = %s", (token,))
                conn.commit()
            return ok({'ok': True})

        return err('Неизвестное действие', 400)
    finally:
        cur.close()
        conn.close()