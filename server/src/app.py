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
    from auth import login, is_valid_token
    from members import get_all_members, get_member, register_member, get_email, get_newsletter_email, verify_email, \
        toggle_active, vipps_csv_activate, delete_member, get_all_studyprograms, check_vipps_id
    from db import init as init_db
    from members import init as init_members

    init_db(loop)
    init_members()

    cors = aiohttp_cors.setup(app)

    """register_resource = cors.add(app.router.add_resource("/api/register"))
    route = cors.add(
        register_resource.add_route("POST", register_member), {
            "*": aiohttp_cors.ResourceOptions(
                allow_credentials=True,
                expose_headers="*",
                allow_headers="*"
            )
        }
    )
    """

    app.add_routes([web.get('/api/user/{name}', get_member),
                    web.get('/api/allusers', get_all_members),
                    web.get('/api/get_email', get_email),
                    web.get('/api/get_newsletter_email', get_newsletter_email),
                    web.get('/api/get_all_studyprograms', get_all_studyprograms),
                    web.get('/api/get_valid_token/{token}', is_valid_token),
                    web.get('/api/confirm_email/{verification_code}', verify_email),
                    web.post('/api/check_vipps_transaction_id', check_vipps_id),
                    web.post('/api/login', login),
                    web.post('/api/register', register_member),
                    web.post('/api/toggle_active', toggle_active),
                    web.post('/api/csv_activate', vipps_csv_activate),
                    web.delete('/api/delete_member', delete_member)])

    # Configure default CORS settings.
    cors = aiohttp_cors.setup(app, defaults={
        "*": aiohttp_cors.ResourceOptions(
            allow_credentials=True,
            expose_headers="*",
            allow_headers="*",
        )
    })

    # Configure CORS on all routes.
    for route in list(app.router.routes()):
        cors.add(route)

    web.run_app(app)
