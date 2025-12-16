import os
from fastapi import Request
from fastapi.responses import PlainTextResponse
from twilio.request_validator import RequestValidator
from dotenv import load_dotenv

load_dotenv()

TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
print("TWILIO_AUTH_TOKEN loaded:", bool(TWILIO_AUTH_TOKEN))

async def validate_twilio_request(request: Request, call_next):
    # Only validate POST requests to /twilio endpoints
    if request.url.path.startswith("/twilio") and request.method == "POST":
        if not TWILIO_AUTH_TOKEN:
            return PlainTextResponse("Twilio auth token not configured", status_code=500)

        validator = RequestValidator(TWILIO_AUTH_TOKEN)

        signature = request.headers.get("X-Twilio-Signature")
        if not signature:
            return PlainTextResponse("Missing Twilio signature", status_code=403)

        proto = request.headers.get("x-forwarded-proto", request.url.scheme)
        host = request.headers.get("x-forwarded-host", request.headers.get("host"))
        url = f"{proto}://{host}{request.url.path}"

        # Read the form once and store it in request.state
        form = await request.form()
        request.state.twilio_form = form  # store for route to reuse
        params = dict(form)

        if not validator.validate(url, params, signature):
            return PlainTextResponse("Invalid Twilio signature", status_code=403)

    return await call_next(request)
