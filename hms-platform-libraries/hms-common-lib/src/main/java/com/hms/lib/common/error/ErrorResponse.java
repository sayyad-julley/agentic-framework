package com.hms.lib.common.error;

import java.time.Instant;

public record ErrorResponse(
        String errorCode,
        String message,
        Instant timestamp,
        String traceId
) {}
