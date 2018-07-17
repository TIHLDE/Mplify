import aiomysql
import json
from aiohttp import web

from app import get_environ_sfe

DB_PASSWORD = ''
DB_USER = ''
DB_NAME = ''
loop = None


def init(loo):
    global DB_PASSWORD, DB_USER, DB_NAME
    global loop
    DB_PASSWORD =get_environ_sfe('DB_PASSWORD')
    DB_USER = get_environ_sfe('DB_USER')
    DB_NAME = get_environ_sfe('DB_NAME')
    loop = loo


async def mysql_connect():
    """ Returns a Connection-instance,
     and Cursor-instance from same connection
    """
    conn = await aiomysql.connect(host='tihlde.org', port=3306,
                                  user=DB_USER, password=DB_PASSWORD,
                                  db=DB_NAME, loop=loop, cursorclass=aiomysql.DictCursor)
    cur = await conn.cursor()
    return conn, cur


async def get_member(request):
    (conn, cur) = await mysql_connect()

    """ Returns all members with 'first_name' or 'last_name' ==  search_string
        
        Keyword arguments:
        request -- http-request object
        search_string -- retrieved from '/api/user/{name}'
        
    NOT FINISHED: Needs to incorporate admin-authentication method
    """

    try:
        name = str(request.match_info['name'])
        await cur.execute("SELECT * FROM user WHERE  first_name = %s OR last_name = %s", (name, name))
        r = await cur.fetchall()
        return web.json_response(json.dumps(r, default=str))

    finally:
        await cur.close()
        conn.close()


async def get_all_members(request):
    (conn, cur) = await mysql_connect()

    """ Returns all members 

    NOT FINISHED: Needs to incorporate admin-authentication method
    """

    try:
        await cur.execute("SELECT * FROM user")
        r = await cur.fetchall()
        return web.json_response(json.dumps(r, default=str))

    finally:
        await cur.close()
        conn.close()
