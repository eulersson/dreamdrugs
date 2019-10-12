FROM tensorflow/tensorflow:latest-py3

WORKDIR /dreambox/backend

COPY poetry.lock pyproject.toml ./

RUN pip install poetry \
 && poetry config settings.virtualenvs.create false \
 && poetry install $(test "$ENV" = "production" && echo "--no-dev") --no-interaction

COPY . .

CMD ./run.sh
