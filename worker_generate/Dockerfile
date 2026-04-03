FROM python:3.9-slim

WORKDIR /worker_generate

COPY . .

RUN pip install --no-cache-dir -r requirements.txt

CMD ["python", "-u", "worker_generate.py"]