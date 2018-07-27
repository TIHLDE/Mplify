from aiohttp import web
import asyncio
import os
import aiohttp_cors


def get_environ_sfe(name, default=None):
    if name not in os.environ:
        return default
    else:
        return os.environ[name]


app = web.Application()

loop = asyncio.get_event_loop()

if __name__ == '__main__':
    from auth import login
    from members import get_all_members, get_member, register_member, get_email, get_newsletter_email, verify_email, \
        toggle_active
    from db import init

    init(loop)

    cors = aiohttp_cors.setup(app)

    register_resource = cors.add(app.router.add_resource("/api/register"))
    route = cors.add(
        register_resource.add_route("POST", register_member), {
            "*": aiohttp_cors.ResourceOptions(
                allow_credentials=True,
                expose_headers="*",
                allow_headers="*"
            )
        }
    )

    app.add_routes([web.get('/api/user/{name}', get_member),
                    web.get('/api/allusers', get_all_members),
                    web.get('/api/get_email', get_email),
                    web.get('/api/get_newsletter_email', get_newsletter_email),
                    web.get('/api/confirm/{info}', verify_email),
                    web.post('/api/login', login),
                    web.post('/api/toggle_active', toggle_active)])

    web.run_app(app)
