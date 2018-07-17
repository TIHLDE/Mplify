from aiohttp import web
from functools import wraps

from members import mysql_connect

sessions = {}


async def login(request):
    conn, cur = await mysql_connect()
    pass


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
            if token not in sessions:
                return bad_creds_response()
            return await f(request)

        return wrapper

    return decorator(func) if func else decorator
