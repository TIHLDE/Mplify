import aiomysql
from app import get_environ_sfe


def init(loo):
    global DB_PASSWORD, DB_USER, DB_NAME
    global loop
    DB_PASSWORD = get_environ_sfe('DB_PASSWORD')
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
