from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace * with your frontend origin in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request model
class SearchRequest(BaseModel):
    searchText: str | None = None
    location: str | None = None
    time: str | None = None
    foodPreference: str | None = None
    price: int | None = None

@app.post("/run-ai")
async def run_ai(data: SearchRequest):
    print("AI logic triggered from frontend")  # This prints in the terminal
    return {"result": "AI triggered",
            "searchText": data.searchText,
            "location": data.location,
            "time": data.time,
            "foodPreference": data.foodPreference,
            "price": data.price
            }
