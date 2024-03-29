import json
import hashlib
import random
from datetime import date
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import datetime

from aiohttp import web
from pymysql import MySQLError

from db import mysql_connect
from auth import requires_auth
from app import get_environ_sfe


EMAIL_PASSWORD = ''
EMAIL_USER = ''
EMAIL_HOST = ''
loop = None
SEMESTER_SLUTT = {"month": 6, "day": 15}


def init():
    global EMAIL_PASSWORD, EMAIL_USER, EMAIL_HOST
    EMAIL_PASSWORD = get_environ_sfe("EMAIL_PASSWORD")
    EMAIL_USER = get_environ_sfe("EMAIL_USER")
    EMAIL_HOST = get_environ_sfe("EMAIL_HOST")


async def check_vipps_id(request):

    try:
        (conn, cur) = await mysql_connect()
        vipps_id = str(request.match_info['vipps_id'])
        q = request.query
        user_id = None
        if 'user_id' in q:
            user_id = q['user_id']
            await cur.execute("Select * from user where vipps_transaction_id = %s AND user_id = %s", [vipps_id, user_id])
            r = cur.rowcount
            if r == 1:
                return web.Response(status=200,
                                    text='{"msg": "Transaction id belongs to userId."}',
                                    content_type='application/json')

        await cur.execute("Select * from user where vipps_transaction_id = %s", vipps_id)
        r = cur.rowcount
        if r == 0:
            return web.Response(status=200,
                                text='{"msg": "Transaction id is unique."}',
                                content_type='application/json')
        else:
            return web.Response(status=401,
                                text='{"msg": "Vipps transaction id not unique."}',
                                content_type='application/json')

    except MySQLError as e:
        print(e)
        return web.Response(status=500,
                            text=json.dumps(e, default=str),
                            content_type='application/json')

    finally:
        await cur.close()
        conn.close()


async def check_student_email(request):

    try:
        (conn, cur) = await mysql_connect()
        bod = await request.json()

        if 'studentEmail' not in bod:
            return web.Response(status=401,
                                text='{"msg": "studentEmail not in body"}',
                                content_type='application/json')
        student_email = bod['studentEmail']

        await cur.execute("select * from user where student_email = %s ", student_email)
        if cur.rowcount != 0:
            return web.Response(status=409,
                                text='{"msg": "Student email already in use."}',
                                content_type='application/json')

        else:
            return web.Response(status=200,
                                text='{"msg": "Student email is unique."}',
                                content_type='application/json')

    except MySQLError as e:
        print(e)
        return web.Response(status=500,
                            text=json.dumps(e, default=str),
                            content_type='application/json')

    finally:
        await cur.close()
        conn.close()


@requires_auth
async def update_member(request):

    try:
        (conn, cur) = await mysql_connect()
        bod = await request.json()
        if input_ok(bod):
            userId = bod['userId']
            first_name = bod['firstName']
            last_name = bod['lastName']
            student_email = bod['studentEmail']
            private_email = bod['privateEmail']
            year_of_admission = int(bod['yearOfAdmission'])
            newsletter = bod['newsletter']
            trans_id = bod['vippsTransactionId']
            vipps_transaction_id = trans_id if trans_id != '' else None
            study_programme_id = bod['studyProgrammeId']
            private_email = private_email if private_email != '' else None

            await cur.execute("update user set first_name = %s, last_name = %s, student_email = %s, "
                              "private_email = %s, year_of_admission = %s, "
                              "newsletter = %s, vipps_transaction_id = %s, "
                              "study_programme_id = %s where user_id = %s",
                              [first_name, last_name, student_email, private_email, year_of_admission,
                               newsletter, vipps_transaction_id, study_programme_id, userId])

            print(cur.rowcount)
            await conn.commit()
            return web.Response(status=200,
                                text='{"msg": "Member updated."}',
                                content_type='application/json')

        else:
            return web.Response(status=401,
                                text='{"msg": "Invalid input."}',
                                content_type='application/json')

    except MySQLError as e:
        print(e)
        return web.Response(status=500,
                            text=json.dumps(e, default=str),
                            content_type='application/json')

    finally:
        await cur.close()
        conn.close()


async def register_member(request):
    """

    """

    try:
        (conn, cur) = await mysql_connect()
        bod = await request.json()
        if input_ok(bod):
            first_name = bod['firstName']
            last_name = bod['lastName']
            student_email = bod['studentEmail']
            private_email = bod['privateEmail']
            year_of_admission = int(bod['yearOfAdmission'])
            active = 0
            verified_email = 0
            email_verification_code = generate_verification_code()
            newsletter = bod['newsletter']
            trans_id = bod['vippsTransactionId']
            vipps_transaction_id = trans_id if trans_id != '' else None
            study_programme_id = bod['studyProgrammeId']

            await cur.execute("INSERT INTO user(first_name, last_name, student_email, private_email, year_of_admission,"
                              " active, email_verification_code, verified_student_email,"
                              " newsletter, vipps_transaction_id, study_programme_id) "
                              "VALUES(%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)",
                              [first_name, last_name, student_email, private_email, year_of_admission, active,
                               email_verification_code, verified_email, newsletter,
                               vipps_transaction_id, study_programme_id]
                              )
            await conn.commit()
            print("Member: '{}' has been added to the database.".format(first_name + ' ' + last_name))
            student_username = student_email.split('@')[0]

            link = 'http://medlem.studentalt.no/#/confirm/{0}_{1}'.format(email_verification_code, student_username)
            email_content = 'Hei!\nDu har mottatt denne meldingen fordi det blir forsøkt å registrere seg som SALT medlem med denne epostadressen.\n' \
                            'Om dette ikke er tilfelle, vennligst se bort ifra denne eposten.\n\n' \
                            'For å bekrefte brukeren din, klikk på følgende lenke:\n' \
                            '{0}\n\n' \
                            'Mvh.\nSALT'.format(link)
            success, msg = send_email(student_email, "Epostbekreftelse for SALT-medlem", email_content)

            if success:
                return web.Response(status=200,
                                    text='{"msg": "%s"}' % msg,
                                    content_type='application/json')
            else:
                return web.Response(status=500,
                                    text=json.dumps(msg, default=str),
                                    content_type='application/json')
        else:
            return web.Response(status=401,
                                text='{"msg": "Invalid input."}',
                                content_type='application/json')

    except MySQLError as e:
        print(e)

    finally:
        await cur.close()
        conn.close()


@requires_auth
async def send_new_email_verification_code(request):
    """
    Updates 'email_verification_code' for the member specified, and send confirmation email with generated
    activation link.

    :param request: http-request with 'studentEmail': '<student email>'
    :return: status 200 and msg if successful, status 500 and error information if not.
    """

    try:
        (conn, cur) = await mysql_connect()
        bod = await request.json()
        if 'studentEmail' not in bod:
            return web.Response(status=401,
                                text='{"msg": "studentEmail not in body"}',
                                content_type='application/json')
        student_email = bod['studentEmail']

        email_verification_code = generate_verification_code()

        await cur.execute("update user set email_verification_code = %s where student_email = %s",
                          [email_verification_code, student_email])
        await conn.commit()
        print("Success: email_verification code updated for user with student_email {}.".format(student_email))

        student_username = student_email.split('@')[0]

        link = 'http://medlem.studentalt.no/#/confirm/{0}_{1}'.format(email_verification_code, student_username)
        email_content = 'Hei!\nDu har mottatt denne meldingen fordi det blir forsøkt å registrere seg som SALT medlem med denne epostadressen.\n' \
                        'Om dette ikke er tilfelle, vennligst se bort ifra denne eposten.\n\n' \
                        'For å bekrefte brukeren din, klikk på følgende lenke:\n' \
                        '{0}\n\n' \
                        'Mvh.\nSALT'.format(link)
        success, msg = send_email(student_email, "Epostbekreftelse for SALT-medlem", email_content)

        if success:
            return web.Response(status=200,
                                text='{"msg": "%s"}' % msg,
                                content_type='application/json')
        else:
            return web.Response(status=500,
                                text=json.dumps(msg, default=str),
                                content_type='application/json')

    except MySQLError as e:
        print(e)

    finally:
        await cur.close()
        conn.close()


@requires_auth
async def toggle_email_verified(request):
    """
    Toggles the 'verified_student_email' attribute of a user with the given userId.

    :param request:
    :return: status 200 if success, 404 if user not found, 500 if MySQL error.
    """
    try:
        (conn, cur) = await mysql_connect()
        user_id = str(request.match_info['user_id'])

        await cur.execute("update user set verified_student_email = not verified_student_email where user_id = %s", [user_id, ])
        await conn.commit()

        r = cur.rowcount
        if r == 1:
            return web.Response(status=200,
                                text='{"msg": "email_verified attribute flipped."}',
                                content_type='application/json')
        else:
            return web.Response(status=404,
                                text='{"error": "No user found with user_id %"}' % user_id,
                                content_type='application/json')

    except MySQLError as e:
        print(e)
        return web.Response(status=500,
                            text='{"error": "%s"}' % e,
                            content_type='application/json')


@requires_auth
async def get_expired_members(request):
    """
    Returns a list of all members that should have finished their degree, calculated by current semester and normed time
    for each members associated study programme.

    :param request:
    :return: List of all expired members.
    """

    try:
        (conn, cur) = await mysql_connect()

        today = datetime.date.today()
        this_year = today.year
        semester_slutt = datetime.date(year=this_year, month=SEMESTER_SLUTT['month'], day=SEMESTER_SLUTT['day'])

        if (semester_slutt - today).days > 0:
            this_year -= 1

        await cur.execute("SELECT u.user_id, u.first_name, u.last_name, u.student_email, s.name, "
                          "u.year_of_admission, s.length as 'normed_years' FROM user u join study_programme s on "
                          "u.study_programme_id = s.study_programme_id where (%s - u.year_of_admission) >= s.length "
                          "order by u.user_id ASC",
                          this_year)
        r = await cur.fetchall()
        return web.Response(status=200,
                            text=json.dumps(r, default=str),
                            content_type='application/json')

    except MySQLError as e:
        print(e)
        return web.Response(status=500,
                            text='{"error": "%s"}' % e,
                            content_type='application/json')

    finally:
        await cur.close()
        conn.close()


async def get_tos(request):
    """
    Returns the current Terms of Service text.

    :param request:
    :return: 200 and the current Terms of Service text.
    """
    try:
        (conn, cur) = await mysql_connect()

        await cur.execute("Select text from terms_of_service where id = 1")
        r = await cur.fetchall()

        return web.Response(status=200,
                            text=json.dumps(r, default=str),
                            content_type='application/json')
    except MySQLError as e:
        print(e)
        return web.Response(status=500,
                            text='{"error": "%s"}' % e,
                            content_type='application/json')

    finally:
        await cur.close()
        conn.close()


@requires_auth
async def update_tos(request):
    """
    Updates the Terms of Service text.

    :param request: Contains a body with the new Terms of Service text
    :return: 200 if updated successfully, 401 if the payload is bad, and 500 if an Error occured.
    """

    try:
        (conn, cur) = await mysql_connect()
        bod = await request.json()
        if not "termsOfService" in bod.keys():
            return web.Response(status=401,
                                text='{"msg": "termsOfService key not in body."}',
                                content_type='application/json')
        await cur.execute("update terms_of_service set text = %s where id = 1", bod["termsOfService"])
        r = cur.rowcount
        await conn.commit()
        if r == 1:
            return web.Response(status=200,
                                text='{"msg": "Terms of service updated."}',
                                content_type='application/json')

    except MySQLError as e:
        return web.Response(status=500,
                            text='{"error": "%s"}' % e,
                            content_type='application/json')

    finally:
        await cur.close()
        conn.close()


@requires_auth
async def get_member(request):
    """
    Returns all members with 'first_name' or 'last_name' equal to search_string from end of url
    :param request: Information about first name or last name of person(s) to return, given in URL
    :return: All members qualifying for the search_string

    """

    try:
        (conn, cur) = await mysql_connect()
        name = str(request.match_info['name'])

        await cur.execute("SELECT user.user_id, user.first_name, user.last_name, user.student_email, user.private_email, "
                          "user.year_of_admission, user.newsletter, user.vipps_transaction_id, "
                          "study_programme.programme_code "
                          "FROM user INNER JOIN study_programme "
                          "ON user.study_programme_id=study_programme.study_programme_id "
                          "WHERE  user.first_name = %s OR user.last_name = %s", (name, name))

        r = await cur.fetchall()
        return web.Response(status=200,
                            text=json.dumps(r, default=str),
                            content_type='application/json')

    except MySQLError as e:
        print("error")
        print(e)

    finally:
        await cur.close()
        conn.close()


@requires_auth
async def get_all_members(request):
    """
    Returns all members from database
    :param request:
    :return: All members from database
    """

    try:
        (conn, cur) = await mysql_connect()
        await cur.execute("SELECT * from user")
        r = await cur.fetchall()
        return web.Response(status=200,
                            text=json.dumps(r, default=str),
                            content_type='application/json')

    except MySQLError as e:
        print(e)

    finally:
        await cur.close()
        conn.close()


@requires_auth
async def get_newsletter_email(request):
    """
    Returns all member student emails wanting newsletter-email
    :param request:
    :return: A json list of all email addresses wanting newsletter mail
    """
    try:
        (conn, cur) = await mysql_connect()
        await cur.execute("SELECT DISTINCT private_email FROM user "
                          "WHERE newsletter = 1 AND active = 1 AND verified_student_email = 1")
        r = await cur.fetchall()
        return web.Response(status=200,
                            text=json.dumps(r, default=str,),
                            content_type='application/json')

    except MySQLError as e:
        print("error")
        print(e)

    finally:
        await cur.close()
        conn.close()


@requires_auth
async def get_email(request):
    """
    Returns all member student-emails
    :param request: aiohttp.web.Request object
    :return: A json list of all emailaddresses wanting newsletter mail
    """
    try:
        (conn, cur) = await mysql_connect()
        await cur.execute("SELECT DISTINCT student_email FROM user "
                          "WHERE active = 1 AND verified_student_email = 1")
        r = await cur.fetchall()
        return web.Response(status=200,
                            text=json.dumps(r, default=str,),
                            content_type='application/json')

    except MySQLError as e:
        print("error")
        print(e)
        return web.Response(status=500,
                            text='{"error": "Something went wrong when trying to retrieve emails"',
                            content_type='application/json')

    finally:
        await cur.close()
        conn.close()


async def verify_email(request):
    """
    Verifies member's student Email through unique URI containing verification code and student-email address.

    :param request: Contains information about verification code and student email
    :return Response: status 200 if okay, 500 if not
    """

    try:
        (conn, cur) = await mysql_connect()
        bod = str(request.match_info['verification_code'])
        body_split = bod.split('_')
        if not len(body_split) == 2:
            return web.Response(status=401,
                                text='{"error": "The verifictaion code was invalid"}',
                                content_type='application/json')
        verification_code = body_split[0]

        student_epost = body_split[1] + "@stud.ntnu.no"

        await cur.execute("UPDATE user SET verified_student_email = 1 "
                          "WHERE student_email = %s and email_verification_code = %s", (student_epost, verification_code))

        await conn.commit()
        r = cur.rowcount
        if r == 1:
            return web.Response(status=200,
                                text='{"msg": "Email verified"}',
                                content_type='application/json')
        else:
            return web.Response(status=401,
                                text='{"error": "The verifictaion code was invalid"}',
                                content_type='application/json')

    except MySQLError as e:
        print("error")
        print(e)
        return web.Response(status=500,
                            text='{"error": "Something went wrong when trying to verify email"',
                            content_type='application/json')

    finally:
        await cur.close()
        conn.close()


@requires_auth
async def toggle_active(request):
    """
    Activates or deactivates a member
    :param request: Specifies 'userId' and whether to activate or deactivate.
    :return aiohttp.web.Response: status 200 if update ok, 400 if incorrect parameters, 500 if internal error.
    """

    try:
        (conn, cur) = await mysql_connect()
        bod = await request.json()
        if not all(keys in bod for keys in ("userId", "active")):
            return web.Response(status=400,
                                text='{"error": "Something went wrong when trying to activate member. '
                                     'Post arguments are missing."',
                                content_type='application/json')

        await cur.execute("UPDATE user SET active = %s WHERE user_id = %s", (bod['active'], bod['userId']))
        await conn.commit()

        status = "activated" if not bod['active'] == "0" else "deactivated"
        msg = '"msg": "Member {}'.format(status)
        return web.Response(status=200,
                            text=json.dumps(msg),
                            content_type='application/json')

    except MySQLError as e:
        print("error")
        print(e)
        return web.Response(status=500,
                            text='{"error": "Something went wrong when trying to activate member"',
                            content_type='application/json')

    finally:
        await cur.close()
        conn.close()


@requires_auth
async def check_vipps_activate_rows(request):
    """
    Checks and returns the amount of members that would be activated by a given csv-upload.

    :param request: Contains the csv data used for checking.
    :return: status 200 and number of activations that would result from the csv-file; status 500 if an Error occured.
    """
    try:
        (conn, cur) = await mysql_connect()
        bod = await request.text()
        lines = bod.splitlines()
        vipps_ids = []
        for l in lines:
            split = l.split(',')
            if all(keys in split for keys in ("TransactionInfo", "Studentforeningen SALT", "350.00")):
                vipps_ids.append(split[4])
        format_strings = ','.join(['%s'] * len(vipps_ids))

        await cur.execute("SELECT count(distinct vipps_transaction_id) as updatableRows "
                          "from user WHERE active = 0 and vipps_transaction_id IN (%s)"
                          % format_strings, tuple(vipps_ids))
        num_updatable= await cur.fetchone()

        return web.Response(status=200,
                            text=json.dumps(num_updatable),
                            content_type='application/json')

    except MySQLError as e:
        return web.Response(status=500,
                            text=json.dumps(e, default=str),
                            content_type='application/json')

    finally:
        await cur.close()
        conn.close()


@requires_auth
async def vipps_csv_activate(request):
    """
    Sets attribute 'active' to 1 in database for all non-active members with matching vipps_transaction_id and correct
    amount paid, found in CSV file received.
    :param request: Contains CSV file in multipart/form-data
    :return Response: status 200 and amount of members activated if ok, 500 if not
    """

    try:
        (conn, cur) = await mysql_connect()
        bod = await request.text()
        lines = bod.splitlines()
        vipps_ids = []
        for l in lines:
            split = l.split(',')
            if all(keys in split for keys in ("TransactionInfo", "Studentforeningen SALT", "350.00")):
                vipps_ids.append(split[4])
        format_strings = ','.join(['%s'] * len(vipps_ids))

        await cur.execute("SELECT student_email from user where active = 0 and vipps_transaction_id"
                          " IN (%s)" % format_strings, tuple(vipps_ids))

        email_list = await cur.fetchall()

        await cur.execute("UPDATE user SET active = 1 WHERE active = 0 and vipps_transaction_id IN (%s)"
                          % format_strings, tuple(vipps_ids))
        num_updated = cur.rowcount
        await conn.commit()

        email_content = 'Hei!\nDin betaling av medlemskontigent via vipps transaksjonsID har nå blitt bekreftet' \
                        ', og ditt medlemskap har blitt aktivert.\n' \
                        '\n\n' \
                        'Mvh.\nSALT'

        emails_sent = 0
        for e in email_list:
            email = e['student_email']
            success, msg = send_email(email, "Ditt medlemskap hos SALT er aktivert", email_content)
            if success:
                emails_sent += 1
        return web.Response(status=200,
                            text='[{"msg": "Members with valid transaction ID activated."},'
                                 ' {"updatedRows": "%s" }]' % num_updated,
                            content_type='application/json')

    except MySQLError as e:
        return web.Response(status=500,
                            text='{"error": "%s"}' % e,
                            content_type='application/json')

    finally:
        await cur.close()
        conn.close()


@requires_auth
async def delete_member(request):
    """
    Deletes a member from database specified by 'userId'
    :param request: Contains 'userId' value of the member to delete from db
    :return: status 200 if  ok, status 500 if not
    """

    try:
        (conn, cur) = await mysql_connect()

        bod = await request.json()
        if "userId" in bod:
            userId = bod["userId"]

            await cur.execute("DELETE FROM user WHERE user_id = %s", userId)
            await conn.commit()
            return web.Response(status=200,
                                text='{"msg": "Member with userId: %s has been deleted."}' % userId,
                                content_type='application/json')

    except MySQLError as e:
        return web.Response(status=500,
                            text='{"error": "%s"}' % e,
                            content_type='application/json')

    finally:
        await cur.close()
        conn.close()


async def get_all_studyprograms(request):

    try:
        (conn, cur) = await mysql_connect()

        await cur.execute("SELECT * FROM study_programme WHERE active = 1")
        r = await cur.fetchall()
        return web.Response(status=200,
                            text=json.dumps(r, default=str, ),
                            content_type='application/json')

    except MySQLError as e:
        print(e)
        return web.Response(status=500,
                            text='{"error": "%s"}' % e,
                            content_type='application/json')

    finally:
        await cur.close()
        conn.close()


# - Web util funcs


def generate_verification_code():
    m = hashlib.md5()
    m.update(str(random.randint(1, 10000)).encode())
    return m.hexdigest()


def input_ok(bod):
    keys = ['firstName', 'lastName', 'studentEmail', 'privateEmail', 'yearOfAdmission',
             'newsletter', 'vippsTransactionId', 'studyProgrammeId']
    for k in keys:
        if k not in bod:
            print('{!r} is not in body.'.format(k))
            return False
    trans_id = bod['vippsTransactionId']
    if len(trans_id) < 9 and trans_id != '':
        return False

    s_email = bod['studentEmail'].lower()
    d = date.today().year
    if not (len(s_email) > 13 and s_email[len(s_email)-13:] == '@stud.ntnu.no' and
            d - 6 < int(bod['yearOfAdmission']) <= d):
        print("Failure 2")
        return False

    return True


def send_email(recipient, subject, body, sender='no-reply@tihlde.org'):
    """
    Sends an email with the given data to the given recipient.

    :param recipient: Recipient email address
    :param subject: Subject of the email
    :param body: Body of the email
    :param sender: Email address of the sender
    :return: True if successful. False if not.
    """
    msg = MIMEMultipart()
    msg['From'] = sender
    msg['To'] = recipient
    msg['Subject'] = subject
    msg.attach(MIMEText(body, 'plain', 'utf-8'))
    text = msg.as_string()
    try:
        smtp_obj = smtplib.SMTP(EMAIL_HOST, port=587)
        smtp_obj.ehlo()
        smtp_obj.starttls()
        smtp_obj.login(user=EMAIL_USER, password=EMAIL_PASSWORD)

        smtp_obj.sendmail(sender, recipient, text)
        return True, "Email sent"

    except smtplib.SMTPException as error:
        return False, 'Unable to send verification email to "{0}". Error-msg:\n{1}'.format(recipient, error)

    finally:
        smtp_obj.quit()
