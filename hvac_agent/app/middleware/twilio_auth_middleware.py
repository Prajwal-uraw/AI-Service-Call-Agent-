import os
from fastapi import Request
from fastapi.responses import PlainTextResponse
from twilio.request_validator import RequestValidator

TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")


async def validate_twilio_request(request: Request, call_next):
    """
    Middleware to validate incoming Twilio webhook requests.
    """

    # Only protect Twilio endpoints
    if request.url.path.startswith("/twilio"):
        if not TWILIO_AUTH_TOKEN:
            return PlainTextResponse(
                "Twilio auth token not configured",
                status_code=500
            )

        validator = RequestValidator(TWILIO_AUTH_TOKEN)

        # Twilio signature header
        signature = request.headers.get("X-Twilio-Signature")
        if not signature:
            return PlainTextResponse("Missing Twilio signature", status_code=403)

        # Full URL Twilio requested
        url = str(request.url)

        # Form data (Twilio sends application/x-www-form-urlencoded)
        form = await request.form()
        params = dict(form)

        # Validate request
        is_valid = validator.validate(url, params, signature)

        if not is_valid:
            return PlainTextResponse("Invalid Twilio signature", status_code=403)

    return await call_next(request)
