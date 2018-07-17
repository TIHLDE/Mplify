FROM python:3.6-alpine

WORKDIR /opt/api

RUN apk --no-cache add git

COPY requirements.txt requirements.txt
RUN pip3 install -r requirements.txt --src /lib

COPY src .

CMD ["python", "app.py", "prod"]