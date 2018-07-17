from aiohttp import web
import asyncio
import os

from auth import login
from members import get_all_members, get_member, init


def get_environ_sfe(name, default=None):
    if name not in os.environ:
        return default
    else:
        return os.environ[name]


app = web.Application()

loop = asyncio.get_event_loop()

if __name__ == '__main__':
    init(loop)

    app.add_routes([web.get('/api/user/{name}', get_member()),
                    web.get('/api/allusers', get_all_members()),
                    web.post('/api/login', login())])

    web.run_app(app)
