import json
import hashlib
import random
from datetime import date
from aiohttp import web
from pymysql import MySQLError

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

            return web.Response(status=200,
                                text='{"msg": "Member has been added to database.}"}',
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


#@requires_auth
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


#@requires_auth
async def get_all_members(request):
    """
    Returns all members from database
    :param request: http-request object
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


#@requires_auth
async def get_newsletter_email(request):

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


#@requires_auth
async def get_email(request):

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

    finally:
        await cur.close()
        conn.close()
