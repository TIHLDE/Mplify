from aiohttp import web
import aiomysql
import asyncio
import os

app = web.Application()


def get_environ_sfe(name, default=None):

    if not name in os.environ:
      return default
    else:
        return os.environ[name]


DB_PASSWORD = get_environ_sfe("SALT_PASSWD")
DB_USER = "salt_linjeforening"
DB_NAME = "salt_linjeforening"


async def mysql_connect():
    conn = await aiomysql.connect(host='tihlde.org', port=3306,
                                       user=DB_USER, password=DB_PASSWORD,
                                       db=DB_NAME, loop=loop)
    cur = await conn.cursor()
    return conn, cur


async def get_all_users():
    (conn, cur) = await mysql_connect()

    await cur.execute("SELECT * FROM user")
    print(cur.description)
    r = await cur.fetchall()
    print(r)
    await cur.close()
    conn.close()


async def get_user(name):
    (conn, cur) = await mysql_connect()

    await cur.execute("SELECT * FROM user WHERE  first_name = %s OR last_name = %s", (name, name))
    r = await cur.fetchall()
    print(r)
    await cur.close()
    conn.close()


loop = asyncio.get_event_loop()
#loop.run_until_complete(get_all_users())
loop.run_until_complete(get_user("Kevin"))

