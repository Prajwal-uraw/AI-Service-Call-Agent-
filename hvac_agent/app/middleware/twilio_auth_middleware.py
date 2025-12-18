import os
from fastapi import Request
from fastapi.responses import PlainTextResponse
from twilio.request_validator import RequestValidator
from starlette.datastructures import FormData

TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")


async def validate_twilio_request(request: Request, call_next):
    """
    Middleware to validate incoming Twilio webhook requests.
    
    IMPORTANT: We read the body and cache it so endpoints can read it again.
    """

    # Only protect Twilio endpoints
    if request.url.path.startswith("/twilio"):
        if not TWILIO_AUTH_TOKEN:
            # Skip validation if no auth token configured (dev mode)
            return await call_next(request)

        validator = RequestValidator(TWILIO_AUTH_TOKEN)

        # Twilio signature header
        signature = request.headers.get("X-Twilio-Signature")
        if not signature:
            return PlainTextResponse("Missing Twilio signature", status_code=403)

        # Full URL Twilio requested
        url = str(request.url)

        # Read body and cache it for later use by endpoints
        body = await request.body()
        
        # Parse form data manually
        from urllib.parse import parse_qs
        params = {}
        if body:
            decoded = body.decode("utf-8")
            parsed = parse_qs(decoded)
            params = {k: v[0] if len(v) == 1 else v for k, v in parsed.items()}
        
        # Cache the parsed form data on the request state
        request.state.twilio_form_data = params

        # Validate request
        is_valid = validator.validate(url, params, signature)

        if not is_valid:
            return PlainTextResponse("Invalid Twilio signature", status_code=403)

    return await call_next(request)
