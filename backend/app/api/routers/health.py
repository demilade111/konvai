from fastapi import APIRouter

from app.core.config import settings
from app.workers.tasks import test_task

router = APIRouter()


@router.get("/health")
async def health():
    return {"status": "ok", "environment": settings.environment}


@router.post("/test-worker")
async def trigger_worker(message: str):
    test_task.delay(message)
    triggerWorkerController()
    
