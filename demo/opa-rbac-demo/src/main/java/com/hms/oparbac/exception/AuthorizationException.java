package com.hms.oparbac.exception;

/**
 * Exception thrown when authorization fails or OPA service is unavailable
 */
public class AuthorizationException extends RuntimeException {
    
    public AuthorizationException(String message) {
        super(message);
    }
    
    public AuthorizationException(String message, Throwable cause) {
        super(message, cause);
    }
}

