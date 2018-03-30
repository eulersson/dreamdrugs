FROM python:slim
MAINTAINER Ramon Blanquer
WORKDIR /dreambox/backend

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
CMD ./run.sh
