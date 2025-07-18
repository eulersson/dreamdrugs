FROM tensorflow/tensorflow:1.13.2-py3

WORKDIR /dreamdrugs/backend

COPY poetry.lock pyproject.toml ./

RUN apt update && apt install -y curl socat rlwrap

RUN pip install --upgrade pip \
 && pip install --upgrade keyrings.alt \
 && pip install poetry \
 && poetry config virtualenvs.create false \
 && poetry install $(test "$DEBUG" = "0" && echo "--no-dev") --no-interaction

RUN mkdir /uploads

COPY . .

CMD ./run.sh
