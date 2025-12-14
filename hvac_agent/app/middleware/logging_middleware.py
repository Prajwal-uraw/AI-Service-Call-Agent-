import time
import logging
from fastapi import Request

logger = logging.getLogger("hvac_middleware")

async def log_requests(request: Request, call_next):
    start = time.time()
    response = await call_next(request)
    process_time = time.time() - start
    logger.info(
        "%s %s completed in %.2fs",
        request.method,
        request.url.path,
        process_time
    )
    return response
