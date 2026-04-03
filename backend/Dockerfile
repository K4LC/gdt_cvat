FROM python:3.9-slim

WORKDIR /backend

COPY . .

RUN pip install --no-cache-dir -r requirements.txt

CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${VITE_API_PORT:-8060} --reload"]