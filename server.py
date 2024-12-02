from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from datetime import datetime
import json
from openai import OpenAI
import uvicorn
from typing import Optional

app = FastAPI()
client = OpenAI()


class ScheduleRequest(BaseModel):
    fixedEvents: str  # JSON string of list of dictionaries
    flexibleEvent: str  # JSON string of dictionary


class Response(BaseModel):
    startingTime: datetime
    reason: str


class ChatRequest(BaseModel):
    message: str
    events: str  # JSON string of current events


class ChatResponse(BaseModel):
    event_id: Optional[str] = None


class RescheduleTimeRequest(BaseModel):
    event: str  # JSON string of event to reschedule
    fixedEvents: str  # JSON string of list of dictionaries


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
                    "content": """You are a smart calendar assistant that help people maintain a balanced and healthy schedule. You help schedule flexible events around existing events. 
                    Always respond with a JSON object containing:
                    - startingTime (string in format 'YYYY-MM-DD HH:mm')
                    - reason (string explaining the choice)
                    
                    The times provided to you are in local time. Please ensure your suggested startingTime is also in local time 
                    using the format 'YYYY-MM-DD HH:mm'.""",
                },
                {
                    "role": "user",
                    "content": f"Fixed events: {request.fixedEvents}. Please suggest a time for this flexible event: {request.flexibleEvent}",
                },
            ],
            temperature=0.0,
            extra_body={"guided_json": Response.model_json_schema()},
        )

        return response.choices[0].message.content

    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON in request")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/reschedule_id")
async def process_chat(request: ChatRequest):
    try:
        events = json.loads(request.events)
        response = client.chat.completions.create(
            model="Qwen/Qwen2.5-32B-Instruct-AWQ",
            messages=[
                {
                    "role": "system",
                    "content": """You are a smart calendar assistant that help people maintain a balanced and healthy schedule. You help schedule flexible events around existing events.
                    When users ask about rescheduling events, analyze their request and respond the correct event ID that they're talking about. If they specifically request to reschedule an event, try to identify which event they're talking about from their message and respond with the event ID with a JSON object containing:
                    - event_id (string)

                    If you cannot identify the event ID, respond with null.
                    """,
                },
                {
                    "role": "user",
                    "content": f"Current events: {events}\n\nUser message: {request.message}",
                },
            ],
            temperature=0.0,
            extra_body={"guided_json": ChatResponse.model_json_schema()},
        )
        
        # Parse the AI response and return it as a proper JSON object
        ai_response = json.loads(response.choices[0].message.content)
        return ChatResponse(**ai_response)

    except Exception as e:
        print(f"Error in process_chat: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    

@app.post("/reschedule_time")
async def reschedule_time(request: RescheduleTimeRequest):
    try:
        # Parse JSON strings to ensure they're valid
        event_to_reschedule = json.loads(request.event)
        fixed_events = json.loads(request.fixedEvents)

        response = client.chat.completions.create(
            model="Qwen/Qwen2.5-32B-Instruct-AWQ",
            messages=[
                {
                    "role": "system",
                    "content": """You are a smart calendar assistant that helps people maintain a balanced and healthy schedule. 
                    You help reschedule events to better times. 
                    Always respond with a JSON object containing:
                    - startingTime (string in format 'YYYY-MM-DD HH:mm')
                    - reason (string explaining why this new time is better)
                    
                    The times provided to you are in local time. Please ensure your suggested startingTime is also in local time 
                    using the format 'YYYY-MM-DD HH:mm'.""",
                },
                {
                    "role": "user",
                    "content": f"Fixed events: {request.fixedEvents}. Please suggest a new time for this event: {request.event}",
                },
            ],
            temperature=0.0,
            extra_body={"guided_json": Response.model_json_schema()},
        )

        return response.choices[0].message.content

    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON in request")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
