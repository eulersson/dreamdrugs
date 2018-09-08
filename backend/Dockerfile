#FROM python:slim
FROM tensorflow/tensorflow:latest-py3
MAINTAINER Ramon Blanquer
WORKDIR /dreambox/backend

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
CMD ./run.sh
