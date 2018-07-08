from aiohttp import web
import asyncio
import os

import server.src.members


def get_environ_sfe(name, default=None):
    if name not in os.environ:
        return default
    else:
        return os.environ[name]


app = web.Application()

loop = asyncio.get_event_loop()

if __name__ == '__main__':
    server.src.members.init(loop)

    app.add_routes([web.get('/api/user/{name}', server.src.members.get_member),
                    web.get('/api/allusers', server.src.members.get_all_members)])

    web.run_app(app)
