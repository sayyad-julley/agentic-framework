# CORS Configuration for API Playground

## Workaround 1: CORS Configuration

**When**: Direct browser requests (non-proxied mode)

**Action**: Configure CORS on target API server to allow Mintlify domain

## Implementation

If your API server needs to handle requests from the Mintlify API playground, you must configure CORS headers to allow requests from Mintlify domains.

### Required CORS Headers

```
Access-Control-Allow-Origin: https://*.mintlify.dev
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Authorization, Content-Type
Access-Control-Allow-Credentials: true
```

### Example: Express.js Configuration

```javascript
const cors = require('cors');

app.use(cors({
  origin: [
    'https://*.mintlify.dev',
    'https://*.mintlify.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Authorization', 'Content-Type']
}));
```

### Example: Spring Boot Configuration

```java
@Configuration
public class CorsConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                    .allowedOrigins("https://*.mintlify.dev", "https://*.mintlify.app")
                    .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                    .allowedHeaders("Authorization", "Content-Type")
                    .allowCredentials(true);
            }
        };
    }
}
```

## Notes

- This workaround is only needed when using direct browser requests (non-proxied mode)
- If using Mintlify's proxy mode, CORS configuration is not required
- Always test CORS configuration in development before deploying

