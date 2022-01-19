FROM python:3.9-alpine

WORKDIR /usr/src/app
COPY requirements.txt requirements.txt

# these packages are for PyMySQL, which aiomysql depends on
RUN apk --no-cache add libffi-dev openssl-dev gcc musl-dev && \
    pip3 install --upgrade pip && \
    pip3 install --no-cache -r requirements.txt --src /lib && \
    apk del openssl-dev gcc musl-dev && \
    addgroup --gid 1001 --system app && \
    adduser -H -s /bin/false -D -u 1001 -S -G app app

USER app

COPY src .

CMD ["python", "app.py", "prod"]
