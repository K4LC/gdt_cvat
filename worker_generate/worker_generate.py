import redis
import json
import time

print("コンテナスタート")

r = redis.Redis(host="queue_db", port=6379, db=0)

def process_task(task_data):
    print("処理開始:", task_data["task_id"])

    time.sleep(2)

    print("処理完了:", task_data["task_id"])

while True:
    print("待機中")
    _, data = r.blpop("task_queue")

    task_data = json.loads(data)

    process_task(task_data)