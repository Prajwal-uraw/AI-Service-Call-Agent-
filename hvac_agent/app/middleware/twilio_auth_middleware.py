import os
from fastapi import Request
from fastapi.responses import PlainTextResponse
from twilio.request_validator import RequestValidator
from dotenv import load_dotenv

load_dotenv()

TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
# Set to "true" to skip signature validation (for debugging)
SKIP_TWILIO_VALIDATION = os.getenv("SKIP_TWILIO_VALIDATION", "true").lower() == "true"


async def validate_twilio_request(request: Request, call_next):
    """
    Middleware to validate incoming Twilio webhook requests.
    
    Parses form data and caches it on request.state for endpoints to use.
    """

    # Only process Twilio endpoints
    if request.url.path.startswith("/twilio"):
        # Read and parse form data
        body = await request.body()
        
        from urllib.parse import parse_qs
        params = {}
        if body:
            decoded = body.decode("utf-8")
            parsed = parse_qs(decoded)
            params = {k: v[0] if len(v) == 1 else v for k, v in parsed.items()}
        
        # Cache the parsed form data on the request state
        request.state.twilio_form_data = params
        
        # Skip validation if disabled or no auth token
        if SKIP_TWILIO_VALIDATION or not TWILIO_AUTH_TOKEN:
            return await call_next(request)

        validator = RequestValidator(TWILIO_AUTH_TOKEN)

        signature = request.headers.get("X-Twilio-Signature")
        if not signature:
            return PlainTextResponse("Missing Twilio signature", status_code=403)

        # Full URL Twilio requested (use X-Forwarded headers for proxied requests)
        scheme = request.headers.get("X-Forwarded-Proto", request.url.scheme)
        host = request.headers.get("X-Forwarded-Host", request.headers.get("Host", request.url.netloc))
        url = f"{scheme}://{host}{request.url.path}"
        if request.url.query:
            url += f"?{request.url.query}"

        # Validate request
        is_valid = validator.validate(url, params, signature)

        if not is_valid:
            return PlainTextResponse("Invalid Twilio signature", status_code=403)

    return await call_next(request)
