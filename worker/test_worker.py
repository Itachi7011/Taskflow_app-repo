# test_worker.py
import mongomock
from bson import ObjectId

from worker import process_task


def make_fake_collection():
    client = mongomock.MongoClient()
    return client.db.taskflow_tasks


def test_process_task_success():
    col = make_fake_collection()
    task_id = col.insert_one(
        {
            "operationType": "uppercase",
            "inputText": "hello",
            "status": "pending",
            "logs": [],
        }
    ).inserted_id

    process_task(col, str(task_id))

    doc = col.find_one({"_id": ObjectId(task_id)})
    assert doc["status"] == "success"
    assert doc["result"] == "HELLO"
    assert any("completed successfully" in log for log in doc["logs"])


def test_process_task_failure_on_bad_operation():
    col = make_fake_collection()
    task_id = col.insert_one(
        {
            "operationType": "not_a_real_operation",
            "inputText": "hello",
            "status": "pending",
            "logs": [],
        }
    ).inserted_id

    process_task(col, str(task_id))

    doc = col.find_one({"_id": ObjectId(task_id)})
    assert doc["status"] == "failed"
    assert doc["errorMessage"] is not None


def test_process_task_missing_task_does_not_crash():
    col = make_fake_collection()
    fake_id = str(ObjectId())
    # should just log and return, not raise
    process_task(col, fake_id)
    assert col.find_one({"_id": ObjectId(fake_id)}) is None
