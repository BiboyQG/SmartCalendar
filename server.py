from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from datetime import datetime
import json
from openai import OpenAI
import uvicorn

app = FastAPI()
client = OpenAI()


class ScheduleRequest(BaseModel):
    fixedEvents: str  # JSON string of list of dictionaries
    flexibleEvent: str  # JSON string of dictionary


class Response(BaseModel):
    startingTime: datetime
    reason: str


@app.post("/schedule")
async def schedule_event(request: ScheduleRequest):
    try:
        # Parse JSON strings to ensure they're valid
        fixed_events = json.loads(request.fixedEvents)
        flexible_event = json.loads(request.flexibleEvent)

        response = client.chat.completions.create(
            model="Qwen/Qwen2.5-32B-Instruct-AWQ",
            messages=[
                {
                    "role": "system",
                    "content": "You are a smart calendar assistant. You help schedule flexible events around fixed events. Always respond with a JSON object containing startingTime (ISO string) and reason (string explaining the choice).",
                },
                {
                    "role": "user",
                    "content": f"Fixed events: {request.fixedEvents}. Please suggest a time for this flexible event: {request.flexibleEvent}",
                },
            ],
            extra_body={"guided_json": Response.model_json_schema()},
        )

        return response.choices[0].message.content

    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON in request")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
