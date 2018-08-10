import json
import hashlib
import random
from datetime import date
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from aiohttp import web
from pymysql import MySQLError

from db import mysql_connect
from auth import requires_auth
from app import get_environ_sfe

EMAIL_PASSWORD = ''
EMAIL_USER = ''
EMAIL_HOST = ''
loop = None


def init():
    global EMAIL_PASSWORD, EMAIL_USER, EMAIL_HOST
    EMAIL_PASSWORD = get_environ_sfe("EMAIL_PASSWORD")
    EMAIL_USER = get_environ_sfe("EMAIL_USER")
    EMAIL_HOST = get_environ_sfe("EMAIL_HOST")


async def register_member(request):
    """
    TODO
     - create function for validating email-address against
       NTNU-ldap ('@stud.ntnu.no' & department)
     - Set correct link-address for production
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

            link = 'https://127.0.0.1/api/confirm/{0}_{1}'.format(email_verification_code, student_email)
            email_content = 'Hei!\nDu har mottatt denne meldingen fordi det blir forsøkt å registrere seg som SALT medlem med denne epostadressen.\n' \
                            'Om dette ikke er tilfelle, vennligst se bort ifra denne eposten.\n\n' \
                            'For å bekrefte brukeren din, klikk på følgende lenke:\n' \
                            '{0}\n\n' \
                            'Mvh.\nSALT'.format(link)
            # success, msg = send_email(student_email, "Epostbekreftelse for SALT-medlem", email_content)
            success = True
            msg = ""
            if success:
                return web.Response(status=200,
                                    text='{"msg": "%s"}' % msg,
                                    content_type='application/json')
            else:
                return web.Response(status=500,
                                    text='{"error": "%s"}' % msg,
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


# @requires_auth
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


# @requires_auth
async def get_newsletter_email(request):
    """
    Returns all member student emails wanting newsletter-email
    :param request:
    :return: A json list of all email addresses wanting newsletter mail
    """
    try:
        (conn, cur) = await mysql_connect()
        await cur.execute("SELECT first_name, last_name, student_email FROM user WHERE newsletter = 1 AND active = 1")
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


# @requires_auth
async def get_email(request):
    """
    Returns all member student-emails
    :param request: aiohttp.web.Request object
    :return: A json list of all emailaddresses wanting newsletter mail
    """
    try:
        (conn, cur) = await mysql_connect()
        await cur.execute("SELECT user_id, first_name, last_name, student_email FROM user WHERE active = 1")
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
    Verifies member's student Email through unique URI containing verification code and student-email addresse.
    :param request: Contains information about verification code and student email
    :return Response: status 200 if okay, 500 if not

    TODO:
    Fix logic!
    """

    try:
        (conn, cur) = await mysql_connect()
        bod = await request.json()
        if "emailVerificationCode" not in bod:
            return web.Response(status=401,
                                text='{"msg": "No verification code sent."}',
                                content_type='application/json')
        verification_code = bod['emailVerificationCode']
        info = verification_code.split('_')
        await cur.execute("UPDATE user SET verified_student_email = 1 "
                          "WHERE email_verification_code = %s", verification_code)

        await conn.commit()
        r = cur.rowcount
        print(r)
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


# @requires_auth
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
                                     'Post parameters are missing."',
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


# @requires_auth
async def vipps_csv_activate(request):
    """
    Sets attribute 'active' to 1 in database for all members with matching vipps_transaction_id and correct
    amount paid, found in CSV file received.
    :param request: Contains CSV file in multipart/form-data
    :return Response: status 200 if ok, 500 if not
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

        await cur.execute("UPDATE user SET active = 1 WHERE vipps_transaction_id IN (%s)"
                          % format_strings, tuple(vipps_ids))
        await conn.commit()
        return web.Response(status=200,
                            text='{"msg": "Members with valid transaction ID activated."}',
                            content_type='application/json')

    except MySQLError as e:
        print(e)
        return web.Response(status=500,
                            text='{"error": "%s"}' % e,
                            content_type='application/json')

    finally:
        await cur.close()
        conn.close()


# @requires_auth
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
        print(e)
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
    m.update(str(random.randint).encode())
    return m.hexdigest()


def input_ok(bod):
    keys = ['firstName', 'lastName', 'studentEmail', 'privateEmail', 'yearOfAdmission',
             'newsletter', 'vippsTransactionId', 'studyProgrammeId']
    for k in keys:
        if k not in bod:
            print('{!r} is not in body.'.format(k))
            return False
    trans_id = bod['vippsTransactionId']
    print(type(trans_id))
    if len(trans_id) != 10 and trans_id != '':
        return False

    s_email = bod['studentEmail'].lower()
    d = date.today().year
    if not (len(s_email) > 13 and s_email[len(s_email)-13:] == '@stud.ntnu.no' and
            d - 6 < int(bod['yearOfAdmission']) <= d):
        print("Failure 2")
        return False

    return True


def send_email(recipient, subject, body, sender='orjanbv@tihlde.org'):
    """
    Sends an email with the given data to the given recipient.
    :param recipient: Recipient email address
    :param subject: Subject of the email
    :param body: Body of the email
    :param sender: Email address of the sender
    :param smtp_host: Host to send the email with. Standard is 'localhost'
    :return: None if successful. Error-msg if not.

    TODO:
        - Configure correct smtp-host and sender
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