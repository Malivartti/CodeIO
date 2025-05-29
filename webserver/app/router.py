from fastapi import APIRouter

import app.auth.api
import app.user.api

api_router = APIRouter()
api_router.include_router(app.auth.api.router)
api_router.include_router(app.user.api.me_router)
api_router.include_router(app.user.api.users_router)
