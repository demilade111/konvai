from app.workers.celery import celery_app


@celery_app.task
def test_task(message: str) -> str:
    return f"Worker received: {message}"
