FROM python:slim
MAINTAINER Ramon Blanquer
WORKDIR /dreambox/backend
COPY . .
RUN pip install -r requirements.txt
ENTRYPOINT ["python"]
CMD ["app.py"]
