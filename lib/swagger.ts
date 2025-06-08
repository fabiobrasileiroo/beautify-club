// lib/swagger.ts
import { createSwaggerSpec } from 'next-swagger-doc';

export function getApiDocs() {
  return createSwaggerSpec({
    apiFolder: 'app/api', // ou 'pages/api', conforme sua estrutura
    definition: {
      openapi: '3.0.0',
      info: { title: 'Minha API', version: '1.0.0' },
      components: {
        securitySchemes: {
          BearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
      security: [],
    },
  });
}
