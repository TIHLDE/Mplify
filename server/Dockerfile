FROM python:3.6-alpine

WORKDIR /opt/api

# these packages are for PyMySQL, which aiomysql depends on
RUN apk --no-cache add libffi-dev openssl-dev gcc musl-dev

COPY requirements.txt requirements.txt
RUN pip3 install -r requirements.txt --src /lib

RUN apk del openssl-dev gcc musl-dev

COPY src .

CMD ["python", "app.py", "prod"]