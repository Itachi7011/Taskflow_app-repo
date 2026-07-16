# Workers Dockerfile
# ---- builder stage ----
# build the deps into a venv here so the final image doesnt need gcc/build
# tools sitting around

FROM python:3.12-slim AS builder
WORKDIR /app
COPY requirements.txt .
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
RUN pip install --no-cache-dir -r requirements.txt

# ---- final stage ----
FROM python:3.12-slim
WORKDIR /app

ENV PYTHONUNBUFFERED=1


# procps gives us pgrep, which the k8s liveness probe uses to check the
# worker process is actually still alive (worker has no http server to
# hit like the backend does)
RUN apt-get update \
    && apt-get install -y --no-install-recommends procps \
    && rm -rf /var/lib/apt/lists/*

# non root user, alpine's python image doesnt ship one by default like
# node does so we make one ourselves
RUN useradd --create-home --shell /bin/bash worker

COPY --from=builder /opt/venv /opt/venv
COPY . .

ENV PATH="/opt/venv/bin:$PATH"

USER worker

CMD ["python", "worker.py"]
