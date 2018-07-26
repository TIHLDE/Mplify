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
            vipps_transaction_id = trans_id if not trans_id == 0 and len(trans_id) > 0 else None
            study_programme_id = bod['studyProgrammeId']

            await cur.execute("INSERT INTO user(first_name, last_name, student_email, private_email, year_of_admission,"
                              " active, email_verification_code, verified_student_email, newsletter, vipps_transaction_id"
                              ", study_programme_id) "
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
            print(send_email(student_email, "Epostbekreftelse for SALT-medlem", email_content))

            return web.Response(status=200,
                                text='{"msg": "Member has been added to database, and verification email has been sent.}"}',
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


def send_email(recipient, subject, body, sender='orjanbv@tihlde.org', smtp_host=get_environ_sfe("EMAIL_HOST")):
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
        smtp_obj = smtplib.SMTP('tihlde.org', port=587)
        smtp_obj.ehlo()
        smtp_obj.starttls()
        smtp_obj.login(user=get_environ_sfe("EMAIL_USER"), password=get_environ_sfe("EMAIL_PASSWORD"))

        smtp_obj.sendmail(sender, recipient, text)
        return "Email sent"

    except smtplib.SMTPException as error:
        return 'Error: unable to send email to "{0}". Error-msg:\n{1}'.format(recipient, error)


def input_ok(bod):
    keys = ['firstName', 'lastName', 'studentEmail', 'privateEmail', 'yearOfAdmission',
             'newsletter', 'vippsTransactionId', 'studyProgrammeId']
    for k in keys:
        if k not in bod:
            print('{!r} is not in body.'.format(k))
            return False

    s_email = bod['studentEmail'].lower()
    d = date.today().year
    if not (len(s_email) > 13 and s_email[len(s_email)-13:] == '@stud.ntnu.no' and
            d - 6 < int(bod['yearOfAdmission']) <= d and len(bod['vippsTransactionId']) == 10):
        print("Failure 2")
        return False

    return True


def generate_verification_code():
    m = hashlib.md5()
    m.update(str(random.randint).encode())
    return m.hexdigest()


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
    :param request: aiohttp.web.Request object
    :return: All members from database
    """

    try:
        (conn, cur) = await mysql_connect()
        await cur.execute("SELECT user.user_id, user.first_name, user.last_name, user.student_email, user.private_email, "
                          "user.year_of_admission, user.newsletter, user.vipps_transaction_id, study_programme.programme_code "
                          "FROM user INNER JOIN study_programme "
                          "ON user.study_programme_id=study_programme.study_programme_id")
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
    :param request: aiohttp.web.Request object
    :return: A json list of all emailaddresses wanting newsletter mail
    """
    try:
        (conn, cur) = await mysql_connect()
        await cur.execute("SELECT first_name, last_name, student_email FROM user WHERE newsletter = 1")
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
        await cur.execute("SELECT first_name, last_name, student_email FROM user")
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

    :param request: aiohttp.web.Request object
    :return:aiohttp.web.Response object with status 200 if okay, 500 if not
    """
    try:
        (conn, cur) = await mysql_connect()

        verification_code, stud_email = str(request.match_info['info']).split('_')
        print(verification_code)
        print(stud_email)
        await cur.execute("UPDATE user SET verified_student_email = 1 "
                          "WHERE student_email = %s AND email_verification_code = %s", (stud_email, verification_code))

        await conn.commit()
        return web.Response(status=200,
                            text='{"msg": "Email verified}"}',
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
