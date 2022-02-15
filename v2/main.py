from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.v1.admin.endpoints import router as adminRouter
from api.v1.token.token import router as tokenRouter
from api.v1.user.endpoints import router as userRouter

from core.database import create_db_and_tables

app = FastAPI(
    title="Mplify.v2",
    description="TIHLDE Mplify API",
    version="0.0.1",
)

origins = [
    "https://localhost",
    "http://localhost",
    "http://localhost:8080",
    "https://localhost:8080",
    # "www.example.com"
    # "http://example.com"
    # "https://example.com"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(userRouter)
app.include_router(adminRouter)
app.include_router(tokenRouter)


@app.on_event("startup")
def on_startup():
    create_db_and_tables()


@app.on_event("shutdown")
def shutdown_event():
    print("Server stopped!")


@app.get("/")
async def read_root():
    return {"Hello": "World"}
