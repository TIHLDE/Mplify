from aiohttp import web
import asyncio
import os
import aiohttp_cors
from logzero import logger

__author__ = "Orjan Bostad Vesterlid"


def get_environ_sfe(name, default=None):
    if name not in os.environ:
        return default
    else:
        return os.environ[name]


app = web.Application()

loop = asyncio.get_event_loop()

if __name__ == '__main__':
    from auth import login, is_valid_token, validate_member
    from members import get_all_members, get_member, register_member, get_email, get_newsletter_email, verify_email, \
        toggle_active, vipps_csv_activate, delete_member, get_all_studyprograms, check_vipps_id, update_tos, get_tos, \
        update_member, check_vipps_activate_rows, check_student_email, send_new_email_verification_code, \
        get_expired_members, toggle_email_verified
    from db import init as init_db
    from members import init as init_members

    init_db(loop)
    init_members()

    cors = aiohttp_cors.setup(app)

    app.add_routes([web.get('/api/user/{name}', get_member),
                    web.get('/api/allusers', get_all_members),
                    web.get('/api/get_email', get_email),
                    web.get('/api/get_newsletter_email', get_newsletter_email),
                    web.get('/api/get_all_studyprograms', get_all_studyprograms),
                    web.get('/api/get_valid_token/{token}', is_valid_token),
                    web.get('/api/confirm_email/{verification_code}', verify_email),
                    web.get('/api/check_vipps_transaction_id/{vipps_id}', check_vipps_id),
                    web.get('/api/get_terms_of_service', get_tos),
                    web.get('/api/validate_member/{student_email}', validate_member),
                    web.get('/api/get_expired_members', get_expired_members),
                    web.post('/api/login', login),
                    web.post('/api/register', register_member),
                    web.post('/api/toggle_active', toggle_active),
                    web.post('/api/toggle_email_verified/{user_id}', toggle_email_verified),
                    web.post('/api/check_vipps_rows', check_vipps_activate_rows),
                    web.post('/api/csv_activate', vipps_csv_activate),
                    web.post('/api/check_student_email', check_student_email),
                    web.post('/api/send_new_email_verification_code', send_new_email_verification_code),
                    web.put('/api/update_terms_of_service', update_tos),
                    web.put('/api/update_member', update_member),
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

    web.run_app(app, host='0.0.0.0', port=8080, access_log=logger)
