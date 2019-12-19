FROM tensorflow/tensorflow:1.13.2-py3

WORKDIR /dreamdrugs/backend

COPY poetry.lock pyproject.toml ./

RUN apt update && apt install -y curl

RUN pip install --upgrade pip \
 && pip install --upgrade keyrings.alt \
 && pip install poetry \
 && poetry config virtualenvs.create false \
 && poetry install $(test "$ENV" = "production" && echo "--no-dev") --no-interaction

COPY . .

CMD ./run.sh
