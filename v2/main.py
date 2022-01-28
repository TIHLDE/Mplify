from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import create_db_and_tables

from api.user.user import router as userRouter
from api.user.login import router as loginRouter
from api.user.register import router as registerRouter


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
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(userRouter)
app.include_router(loginRouter)
app.include_router(registerRouter)


@app.on_event("startup")
def on_startup():
    create_db_and_tables()


@app.on_event("shutdown")
def shutdown_event():
    print("Server stopped!")


@app.get("/")
async def read_root():
    return {"Hello": "World"}
