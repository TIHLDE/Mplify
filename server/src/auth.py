import binascii
import hashlib
import os
import time
import json

from aiohttp import web
from functools import wraps
from pymysql import MySQLError

from db import mysql_connect

sessions = {}
TTL = 900   # 15 minutes
ITERATIONS = 30000


async def validate_member(request):
    try:
        (conn, cur) = await mysql_connect()
        student_email = str(request.match_info['student_email'])

        await cur.execute("select user_id, first_name, last_name from user where student_email = %s "
                          "and active = 1 and verified_student_email = 1", student_email)

        r = await cur.fetchone()

        return web.Response(status=200,
                            text=json.dumps(r, default=str),
                            content_type='application/json')
    except MySQLError as e:
        print(e)
        return web.Response(status=500,
                            text=json.dumps(e, default=str),
                            content_type='application/json')


async def login(request):
    """
    Validates login-credentials and creates session if successful
    :param request:
    :return: Valid token if successful login, 401 http response if unsuccessful.
    """

    try:
        bod = await request.json()
        if not bod['username'] or not bod['password']:
            return bad_creds_response()

        post_usr = bod['username']
        post_passwd = bod['password']

        conn, cur = await mysql_connect()
        await cur.execute("SELECT * FROM login WHERE username = %s", post_usr)
        r = await cur.fetchone()
        if r is None:
            return bad_creds_response()

        password_hash = hash_str(post_passwd, r['salt'], ITERATIONS)
        if password_hash == r['hash']:
            token = create_session(post_usr)
            return web.Response(status=200,
                                text=json.dumps({
                                    'token': token
                                }),
                                content_type='application/json')
        else:
            return bad_creds_response()
    finally:
        await cur.close()
        conn.close()


async def is_valid_token(request):
    token = str(request.match_info['token'])

    if token in sessions.keys():
        return web.Response(status=200,
                            text='{"msg": "Token is valid."}',
                            content_type='application/json')
    else:
        return bad_creds_response()


# -- web util funcs
def bad_creds_response():
    """
    Creates and returns a 401 http response
    :return: The generated 401  http response
    """
    return web.Response(status=401,
                        text='{"error": "Bad credentials"}',
                        content_type='application/json')


def requires_auth(func):
    """
    A decorator to use on aiohttp endpoints to run authentication on all
    requests before calling the endpoint function.
    :param func: The function to wrap
    :return: The decorated function
    """
    def decorator(f):
        @wraps(f)
        async def wrapper(request):
            token = request.headers.get('X-CSRF-Token')
            if not retrieve_session(token):
                return bad_creds_response()
            sessions[token]["expires"] = time.time() + TTL
            return await f(request)

        return wrapper

    return decorator(func) if func else decorator


def generate_token():
    return binascii.hexlify(os.urandom(64)).decode()


def create_session(username):
    token = generate_token()
    sessions[token] = {
        'username': username,
        'expires': time.time() + TTL
    }
    return token


def delete_session(token):
    sessions.pop(token, None)


def retrieve_session(token):
    if token in sessions:
        if time.time() > sessions[token]["expires"]:
            delete_session(token)
            return None

        return sessions[token]

    return None


def hash_str(to_hash: str, salt, iterations):
    """
    Generates a hash from the given string with the specified salt and
    iterations.
    :param to_hash: The string to hash
    :param salt: Salt to use in the hash function
    :param iterations: number of iterations to use in the hash function
    :return:
    """
    return hashlib.pbkdf2_hmac('sha512', to_hash.encode(), salt, iterations,
                               128)
