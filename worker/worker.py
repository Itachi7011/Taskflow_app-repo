"""
worker.py

This is the python background worker for TaskFlow. It sits in a loop,
blocking on redis's BRPOP, and whenever the node backend pushes a task id
onto the queue this picks it up, loads the full task from mongo, runs the
requested string operation on it, and writes the result back.

Workflow (matches the assignment step by step):
  1. node backend already created the task doc with status "pending"
  2. node pushed {"taskId": "..."} onto the TASK_QUEUE_NAME list
  3. we BRPOP it here
  4. flip status to "running"
  5. run the operation
  6. save result + logs
  7. flip status to "success" or "failed"
"""

import json
import os
import signal
import sys
import time
from datetime import datetime, timezone

import redis
from bson import ObjectId
from dotenv import load_dotenv
from pymongo import MongoClient

from operations import run_operation

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/taskflow")
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
QUEUE_NAME = os.getenv("TASK_QUEUE_NAME", "taskflow:task-queue")
BRPOP_TIMEOUT = int(os.getenv("BRPOP_TIMEOUT", "5"))
APP_NAME = os.getenv("APP_NAME", "TaskFlow")

# has to match COLLECTION_NAME in backend/models/Task.js exactly
TASK_COLLECTION = f"{APP_NAME}_tasks".lower()

shutting_down = False


def handle_shutdown(signum, frame):
    # so k8s can send SIGTERM during a rolling update/scale down and we
    # finish whatever job we're on instead of dying mid task
    global shutting_down
    print("Shutdown signal recieved, finishing current job then exiting...")
    shutting_down = True


signal.signal(signal.SIGTERM, handle_shutdown)
signal.signal(signal.SIGINT, handle_shutdown)


def now():
    return datetime.now(timezone.utc)


def process_task(tasks_collection, task_id):
    task = tasks_collection.find_one({"_id": ObjectId(task_id)})

    if not task:
        # shouldnt really happen but just in case the task got deleted
        # between being queued and us picking it up
        print(f"Task {task_id} not found in mongo, skipping")
        return

    print(f"Processing task {task_id} ({task.get('operationType')})")

    tasks_collection.update_one(
        {"_id": task["_id"]},
        {
            "$set": {"status": "running", "startedAt": now(), "updatedAt": now()},
            "$push": {"logs": "Worker picked up the task, status set to running"},
        },
    )

    try:
        result = run_operation(task["operationType"], task["inputText"])

        tasks_collection.update_one(
            {"_id": task["_id"]},
            {
                "$set": {
                    "status": "success",
                    "result": result,
                    "finishedAt": now(),
                    "updatedAt": now(),
                },
                "$push": {"logs": "Operation completed successfully"},
            },
        )
        print(f"Task {task_id} finished successfully")

    except Exception as e:
        # anything that goes wrong in run_operation lands here, we still
        # want to mark the task failed rather than leave it stuck on
        # "running" forever
        print(f"Task {task_id} failed: {e}")
        tasks_collection.update_one(
            {"_id": task["_id"]},
            {
                "$set": {
                    "status": "failed",
                    "errorMessage": str(e),
                    "finishedAt": now(),
                    "updatedAt": now(),
                },
                "$push": {"logs": f"Task failed: {e}"},
            },
        )


def main():
    print(f"Connecting to redis at {REDIS_URL} ...")
    r = redis.from_url(REDIS_URL, decode_responses=True)

    print(f"Connecting to mongo at {MONGODB_URI} ...")
    mongo_client = MongoClient(MONGODB_URI)
    db = mongo_client.get_default_database()
    tasks_collection = db[TASK_COLLECTION]

    print(f"Worker ready, listening on queue '{QUEUE_NAME}'")

    while not shutting_down:
        try:
            # BRPOP blocks up to BRPOP_TIMEOUT seconds, returns None on
            # timeout so we can loop back around and check shutting_down
            job = r.brpop(QUEUE_NAME, timeout=BRPOP_TIMEOUT)

            if job is None:
                continue

            _, raw_payload = job
            payload = json.loads(raw_payload)
            process_task(tasks_collection, payload["taskId"])

        except redis.exceptions.ConnectionError as e:
            # redis might restart/be unreachable for a moment, dont crash
            # the whole pod over it, just wait and retry
            print(f"Redis connection error: {e}, retrying in 3s")
            time.sleep(3)

    print("Worker shut down cleanly")
    sys.exit(0)


if __name__ == "__main__":
    main()
