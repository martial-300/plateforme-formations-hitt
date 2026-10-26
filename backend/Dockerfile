FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app

RUN useradd --create-home api
USER api

EXPOSE 8000
# --proxy-headers : l'IP du visiteur est lue dans X-Forwarded-For (limite d'appels RF-12),
# seulement pour les proxys listés dans FORWARDED_ALLOW_IPS (lu par uvicorn, voir .env.example).
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--proxy-headers"]
