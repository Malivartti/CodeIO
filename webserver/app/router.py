from fastapi import APIRouter

import app.attempt.api
import app.auth.api
import app.task.api
import app.user.api

api_router = APIRouter()
api_router.include_router(app.auth.api.router)
api_router.include_router(app.user.api.me_router)
api_router.include_router(app.user.api.users_router)
api_router.include_router(app.task.api.tasks_router)
api_router.include_router(app.task.api.tags_router)
api_router.include_router(app.attempt.api.router)
