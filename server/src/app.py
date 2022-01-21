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


if __name__ == "__main__":
    import auth
    import members
    import db

    app = web.Application()
    loop = asyncio.get_event_loop()

    db.init(loop)
    members.init()

    app.add_routes(
        [
            web.get("/api/user/{name}", members.get_member),
            web.get("/api/allusers", members.get_all_members),
            web.get("/api/get_email", members.get_email),
            web.get("/api/get_newsletter_email", members.get_newsletter_email),
            web.get(
                "/api/get_all_studyprograms", members.get_all_studyprograms
            ),
            web.get("/api/get_valid_token/{token}", auth.is_valid_token),
            web.get(
                "/api/confirm_email/{verification_code}", members.verify_email
            ),
            web.get(
                "/api/check_vipps_transaction_id/{vipps_id}",
                members.check_vipps_id,
            ),
            web.get("/api/get_terms_of_service", members.get_tos),
            web.get(
                "/api/validate_member/{student_email}", auth.validate_member
            ),
            web.get("/api/get_expired_members", members.get_expired_members),
            web.post("/api/login", auth.login),
            web.post("/api/register", members.register_member),
            web.post("/api/toggle_active", members.toggle_active),
            web.post(
                "/api/toggle_email_verified/{user_id}",
                members.toggle_email_verified,
            ),
            web.post(
                "/api/check_vipps_rows", members.check_vipps_activate_rows
            ),
            web.post("/api/csv_activate", members.vipps_csv_activate),
            web.post("/api/check_student_email", members.check_student_email),
            web.post(
                "/api/send_new_email_verification_code",
                members.send_new_email_verification_code,
            ),
            web.put("/api/update_terms_of_service", members.update_tos),
            web.put("/api/update_member", members.update_member),
            web.delete("/api/delete_member", members.delete_member),
        ]
    )

    # Configure default CORS settings.
    cors = aiohttp_cors.setup(
        app,
        defaults={
            "*": aiohttp_cors.ResourceOptions(
                allow_credentials=True,
                expose_headers="*",
                allow_headers="*",
            )
        },
    )

    # Configure CORS on all routes.
    for route in list(app.router.routes()):
        cors.add(route)

    WEB_IP = get_environ_sfe("WEB_IP", default="0.0.0.0")
    WEB_PORT = get_environ_sfe("WEB_PORT", default=80)

    web.run_app(app, host=WEB_IP, port=WEB_PORT, access_log=logger)
