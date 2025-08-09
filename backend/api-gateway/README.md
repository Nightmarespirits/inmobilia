# PropTech Nexus - API Gateway

API Gateway para la plataforma PropTech Nexus. Actúa como punto de entrada único para todos los microservicios del backend, proporcionando autenticación, autorización, rate limiting, logging y proxy de requests.

## 🚀 Características

- **Proxy de Microservicios**: Enrutamiento inteligente a servicios backend
- **Autenticación JWT**: Validación de tokens y manejo de sesiones
- **Autorización RBAC**: Control de acceso basado en roles
- **Rate Limiting**: Protección contra abuso y DDoS
- **Logging Centralizado**: Trazabilidad completa con correlation IDs
- **Health Checks**: Monitoreo de estado de servicios
- **Seguridad**: Helmet, CORS, compresión y validación
- **Manejo de Errores**: Respuestas consistentes y logging de errores

## 🛠️ Stack Tecnológico

- **Runtime**: Node.js 18+ con TypeScript
- **Framework**: Express.js
- **Proxy**: http-proxy-middleware
- **Autenticación**: JWT (jsonwebtoken)
- **Rate Limiting**: express-rate-limit + express-slow-down
- **Logging**: Winston
- **Seguridad**: Helmet + CORS
- **Cache**: Redis (para rate limiting distribuido)

## 📁 Estructura del Proyecto

```
api-gateway/
├── src/
│   ├── config/           # Configuración de la aplicación
│   ├── middleware/       # Middleware personalizado
│   │   ├── auth.ts       # Autenticación y autorización
│   │   ├── correlation.ts # Correlation IDs
│   │   ├── rateLimiting.ts # Rate limiting
│   │   └── errorHandler.ts # Manejo de errores
│   ├── routes/           # Definición de rutas
│   │   ├── health.ts     # Health checks
│   │   └── proxy.ts      # Proxy a microservicios
│   ├── types/            # Definiciones TypeScript
│   ├── utils/            # Utilidades
│   │   ├── logger.ts     # Logger configurado
│   │   └── response.ts   # Helpers de respuesta
│   └── index.ts          # Punto de entrada
├── logs/                 # Archivos de log
├── Dockerfile           # Imagen Docker
├── docker-compose.yml   # Orquestación local
└── package.json         # Dependencias y scripts
```

## 🔧 Instalación y Configuración

### 1. Instalar Dependencias

```bash
npm install
```

### 2. Configurar Variables de Entorno

Copiar `.env.example` a `.env` y configurar:

```bash
cp .env.example .env
```

Variables principales:
```env
PORT=3000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key
REDIS_URL=redis://localhost:6379
USER_SERVICE_URL=http://localhost:3001
PROPERTY_SERVICE_URL=http://localhost:3002
SEARCH_SERVICE_URL=http://localhost:3003
CHAT_SERVICE_URL=http://localhost:3004
```

### 3. Ejecutar en Desarrollo

```bash
npm run dev
```

### 4. Compilar para Producción

```bash
npm run build
npm start
```

## 🐳 Docker

### Construcción de Imagen

```bash
docker build -t proptech-api-gateway .
```

### Ejecución con Docker Compose

```bash
docker-compose up -d
```

## 📡 Endpoints

### Health Checks

- `GET /health` - Estado completo de servicios
- `GET /ready` - Readiness probe
- `GET /live` - Liveness probe

### Proxy de Servicios

#### Autenticación (User Service)
- `POST /api/auth/register` - Registro de usuarios
- `POST /api/auth/login` - Inicio de sesión
- `POST /api/auth/refresh` - Renovar token
- `POST /api/auth/logout` - Cerrar sesión

#### Usuarios (User Service)
- `GET /api/users/profile` - Perfil del usuario
- `PUT /api/users/profile` - Actualizar perfil
- `GET /api/users/:id` - Obtener usuario por ID

#### Propiedades (Property Service)
- `GET /api/properties` - Listar propiedades
- `GET /api/properties/:id` - Detalle de propiedad
- `POST /api/properties/create` - Crear propiedad (Agentes)
- `PUT /api/properties/:id/edit` - Editar propiedad (Agentes)
- `DELETE /api/properties/:id/delete` - Eliminar propiedad (Agentes)
- `POST /api/favorites/:id` - Agregar a favoritos
- `DELETE /api/favorites/:id` - Quitar de favoritos

#### Búsqueda (Search Service)
- `GET /api/search/properties` - Búsqueda de propiedades
- `POST /api/search/advanced` - Búsqueda avanzada
- `GET /api/search/suggestions` - Sugerencias de búsqueda

#### Chat (Chat Service)
- `GET /api/conversations` - Listar conversaciones
- `POST /api/conversations` - Crear conversación
- `GET /api/conversations/:id/messages` - Mensajes de conversación
- `POST /api/messages` - Enviar mensaje

## 🔐 Autenticación y Autorización

### Roles de Usuario

- `BUYER` - Compradores/arrendatarios
- `AGENT` - Agentes inmobiliarios
- `ADMIN` - Administradores de agencia
- `SUPER_ADMIN` - Super administradores

### Flujo de Autenticación

1. Usuario se registra/inicia sesión en `/api/auth/login`
2. Recibe JWT token con información del usuario
3. Incluye token en header: `Authorization: Bearer <token>`
4. API Gateway valida token y extrae información del usuario
5. Información del usuario se pasa a microservicios via headers

### Headers Enviados a Microservicios

```
X-User-ID: <user_id>
X-User-Role: <user_role>
X-User-Email: <user_email>
X-Correlation-ID: <correlation_id>
```

## 🚦 Rate Limiting

### Configuración por Defecto

- **General**: 100 requests/15min por IP
- **Autenticación**: 5 requests/15min por IP
- **API**: 1000 requests/15min por IP
- **Progressive Slow Down**: Delay incremental después de 50 requests

### Rate Limiting por Usuario

Cuando el usuario está autenticado, el rate limiting se aplica por `user_id` en lugar de IP.

## 📊 Logging y Monitoreo

### Correlation IDs

Cada request recibe un correlation ID único para trazabilidad completa a través de todos los servicios.

### Logs Estructurados

```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "level": "info",
  "message": "Request processed successfully",
  "correlationId": "uuid-v4",
  "service": "api-gateway",
  "userId": "user123",
  "method": "GET",
  "path": "/api/properties",
  "statusCode": 200,
  "responseTime": 150
}
```

## 🔧 Scripts Disponibles

```bash
npm run dev          # Desarrollo con hot reload
npm run build        # Compilar TypeScript
npm start            # Ejecutar en producción
npm run lint         # Linting con ESLint
npm run lint:fix     # Fix automático de linting
npm run format       # Formatear con Prettier
npm test             # Ejecutar tests
npm run test:watch   # Tests en modo watch
npm run test:coverage # Coverage de tests
```

## 🚀 Deployment

### Variables de Entorno de Producción

```env
NODE_ENV=production
JWT_SECRET=<strong-secret-key>
REDIS_URL=redis://<redis-host>:6379
LOG_LEVEL=warn
LOG_FILE_ENABLED=true
```

### Health Checks

El contenedor incluye health checks automáticos:

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health'..."
```

## 🔍 Troubleshooting

### Problemas Comunes

1. **Service Unavailable**: Verificar que los microservicios estén ejecutándose
2. **Rate Limited**: Verificar configuración de rate limiting
3. **Authentication Failed**: Verificar JWT_SECRET y formato de token
4. **CORS Errors**: Verificar configuración de CORS_ORIGIN

### Debug Mode

```bash
LOG_LEVEL=debug npm run dev
```

## 📝 Próximos Pasos

1. ✅ Implementación base del API Gateway
2. 🔄 Integración con User Service
3. 🔄 Integración con Property Service
4. 🔄 Integración con Search Service
5. 🔄 Integración con Chat Service
6. 🔄 Tests unitarios e integración
7. 🔄 Métricas y monitoreo avanzado
8. 🔄 Circuit breakers para resilencia

## 🤝 Contribución

Ver el [README principal del backend](../README.md) para guías de contribución y estándares de código.
