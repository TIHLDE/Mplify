import json
from aiohttp import web

from db import mysql_connect
from auth import requires_auth

DB_PASSWORD = ''
DB_USER = ''
DB_NAME = ''
loop = None


async def register_member(request):
    """
    TODO
     - create function for validating email-address against
       NTNU-ldap ('@stud.ntnu.no' & department)
     - create verification-code generator

    """


@requires_auth
async def get_member(request):
    """
    Returns all members with 'first_name' or 'last_name' equal to search_string from end of url
    :param request: http-request object
    :return: All members qualifying for the search_string
    """

    try:
        (conn, cur) = await mysql_connect()
        name = str(request.match_info['name'])
        await cur.execute("SELECT * FROM user WHERE  first_name = %s OR last_name = %s", (name, name))
        r = await cur.fetchall()
        return web.Response(status=200,
                            text=json.dumps(r, default=str),
                            content_type='application/json')
    finally:
        await cur.close()
        conn.close()


@requires_auth
async def get_all_members(request):
    """
    Returns all members from database
    :param request: http-request object
    :return: All members from database
    """

    try:
        (conn, cur) = await mysql_connect()
        await cur.execute("SELECT * FROM user")
        r = await cur.fetchall()
        return web.Response(status=200,
                            text=json.dumps(r, default=str),
                            content_type='application/json')

    finally:
        await cur.close()
        conn.close()
