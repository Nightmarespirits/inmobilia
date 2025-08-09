# PropTech Nexus Backend - Plan de Implementación 🏗️

## 📋 Resumen Ejecutivo

Este documento detalla el plan completo para implementar el backend de PropTech Nexus usando una arquitectura de microservicios con Node.js/NestJS, PostgreSQL, MongoDB, Redis y Elasticsearch.

## 🎯 Objetivos del Backend

1. **API RESTful completa** para todas las funcionalidades del frontend
2. **Autenticación y autorización** robusta con JWT
3. **CRUD completo** de propiedades con geolocalización
4. **Sistema de chat** en tiempo real con WebSockets
5. **Búsqueda avanzada** con Elasticsearch
6. **Gestión de archivos** e imágenes
7. **Base escalable** para futuras funcionalidades

## 🏛️ Arquitectura de Microservicios

### Servicios Principales

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Mobile App    │    │   Admin Panel   │
│   (Next.js)     │    │ (React Native)  │    │   (Dashboard)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   API Gateway   │
                    │   (Express.js)  │
                    │   Port: 3000    │
                    └─────────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  User Service   │    │Property Service │    │ Search Service  │
│   (NestJS)      │    │   (NestJS)      │    │   (NestJS)      │
│   Port: 3001    │    │   Port: 3002    │    │   Port: 3003    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         │              │  Chat Service   │              │
         │              │   (NestJS)      │              │
         │              │   Port: 3004    │              │
         │              └─────────────────┘              │
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
    ┌─────────────────────────────────────────────────────────┐
    │                    Databases                            │
    │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐       │
    │  │ PostgreSQL  │ │  MongoDB    │ │    Redis    │       │
    │  │ + PostGIS   │ │             │ │   (Cache)   │       │
    │  └─────────────┘ └─────────────┘ └─────────────┘       │
    │                                                         │
    │  ┌─────────────┐                                       │
    │  │Elasticsearch│                                       │
    │  │  (Search)   │                                       │
    │  └─────────────┘                                       │
    └─────────────────────────────────────────────────────────┘
```

## 🛠️ Stack Tecnológico

### Core Technologies
- **Runtime**: Node.js 18+
- **Framework**: NestJS 10+ (TypeScript)
- **API Gateway**: Express.js
- **WebSockets**: Socket.io
- **Validation**: class-validator, class-transformer
- **Documentation**: Swagger/OpenAPI

### Bases de Datos
- **PostgreSQL 15** + PostGIS (datos principales + geolocalización)
- **MongoDB 7.0** (datos flexibles, logs, analytics)
- **Redis 7.2** (cache, sesiones, pub/sub)
- **Elasticsearch 8.11** (búsqueda avanzada)

### Autenticación & Seguridad
- **JWT** para autenticación
- **bcrypt** para hash de passwords
- **helmet** para seguridad HTTP
- **rate-limiting** para protección DDoS
- **CORS** configurado apropiadamente

### Herramientas de Desarrollo
- **TypeScript** (strict mode)
- **ESLint** + **Prettier**
- **Jest** para testing
- **Husky** para git hooks
- **Docker** para containerización

## 📦 Servicios Detallados

### 1. API Gateway (Puerto 3000)
**Responsabilidades:**
- Enrutamiento de requests a microservicios
- Autenticación y autorización centralizada
- Rate limiting y throttling
- Logging y monitoring
- CORS y middleware de seguridad

**Tecnologías:**
- Express.js + TypeScript
- JWT middleware
- Redis para rate limiting
- Winston para logging

### 2. User Service (Puerto 3001)
**Responsabilidades:**
- Gestión de usuarios (CRUD)
- Autenticación (login/register)
- Perfiles de usuario
- Gestión de roles (buyer, agent, admin)
- Recuperación de contraseñas
- Verificación de email

**Base de Datos:**
- PostgreSQL (usuarios, perfiles, roles)
- Redis (sesiones, tokens)

**Endpoints Principales:**
```
POST   /auth/register
POST   /auth/login
POST   /auth/logout
POST   /auth/refresh
GET    /users/profile
PUT    /users/profile
GET    /users/:id
PUT    /users/:id/role
DELETE /users/:id
```

### 3. Property Service (Puerto 3002)
**Responsabilidades:**
- CRUD de propiedades
- Gestión de imágenes y archivos
- Geolocalización con PostGIS
- Favoritos de usuarios
- Estadísticas de propiedades
- Integración con servicios de mapas

**Base de Datos:**
- PostgreSQL + PostGIS (propiedades, ubicaciones)
- MongoDB (metadatos, analytics)
- AWS S3 (imágenes y archivos)

**Endpoints Principales:**
```
GET    /properties
POST   /properties
GET    /properties/:id
PUT    /properties/:id
DELETE /properties/:id
POST   /properties/:id/images
GET    /properties/nearby
POST   /properties/:id/favorite
GET    /users/:id/favorites
```

### 4. Search Service (Puerto 3003)
**Responsabilidades:**
- Indexación de propiedades en Elasticsearch
- Búsqueda avanzada con filtros
- Búsqueda geográfica
- Sugerencias y autocompletado
- Análisis de búsquedas
- Trending searches

**Base de Datos:**
- Elasticsearch (índices de búsqueda)
- Redis (cache de búsquedas)

**Endpoints Principales:**
```
GET    /search/properties
GET    /search/suggestions
GET    /search/trending
POST   /search/advanced
GET    /search/nearby
```

### 5. Chat Service (Puerto 3004)
**Responsabilidades:**
- Mensajería en tiempo real
- Gestión de conversaciones
- Historial de mensajes
- Notificaciones push
- Estados de mensajes (enviado/leído)
- Moderación de contenido

**Base de Datos:**
- MongoDB (mensajes, conversaciones)
- Redis (presencia, pub/sub)

**Endpoints Principales:**
```
GET    /conversations
POST   /conversations
GET    /conversations/:id/messages
POST   /conversations/:id/messages
PUT    /messages/:id/read
WebSocket /chat
```

## 🗄️ Esquema de Base de Datos

### PostgreSQL (Datos Principales)

```sql
-- Usuarios
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role user_role NOT NULL DEFAULT 'buyer',
    is_verified BOOLEAN DEFAULT FALSE,
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Propiedades
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    property_type property_type_enum NOT NULL,
    status property_status_enum DEFAULT 'available',
    bedrooms INTEGER,
    bathrooms INTEGER,
    area_sqm DECIMAL(8,2),
    year_built INTEGER,
    floor_number INTEGER,
    total_floors INTEGER,
    parking_spaces INTEGER,
    location GEOGRAPHY(POINT, 4326),
    address TEXT NOT NULL,
    district VARCHAR(100),
    city VARCHAR(100) DEFAULT 'Lima',
    country VARCHAR(100) DEFAULT 'Peru',
    features JSONB,
    amenities JSONB,
    agent_id UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Imágenes de propiedades
CREATE TABLE property_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    alt_text VARCHAR(255),
    is_primary BOOLEAN DEFAULT FALSE,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Favoritos
CREATE TABLE user_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, property_id)
);
```

### MongoDB (Datos Flexibles)

```javascript
// Conversaciones
{
  _id: ObjectId,
  participants: [ObjectId], // user IDs
  property_id: ObjectId, // optional
  last_message: {
    text: String,
    sender_id: ObjectId,
    timestamp: Date,
    is_read: Boolean
  },
  created_at: Date,
  updated_at: Date
}

// Mensajes
{
  _id: ObjectId,
  conversation_id: ObjectId,
  sender_id: ObjectId,
  text: String,
  message_type: String, // 'text', 'image', 'file'
  attachments: [String], // URLs
  status: String, // 'sent', 'delivered', 'read'
  timestamp: Date
}

// Analytics de búsquedas
{
  _id: ObjectId,
  user_id: ObjectId, // optional
  query: String,
  filters: Object,
  results_count: Number,
  clicked_properties: [ObjectId],
  timestamp: Date,
  session_id: String
}
```

## 🔧 Configuración de Desarrollo

### Variables de Entorno

```env
# General
NODE_ENV=development
PORT=3000

# Base de datos
DATABASE_URL=postgresql://proptech_user:proptech_pass@localhost:5432/proptech_nexus
MONGODB_URL=mongodb://proptech_user:proptech_pass@localhost:27017/proptech_nexus
REDIS_URL=redis://:proptech_pass@localhost:6379
ELASTICSEARCH_URL=http://localhost:9200

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_EXPIRES_IN=30d

# AWS S3 (para imágenes)
AWS_S3_BUCKET=proptech-nexus-media
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1

# Email (para verificación)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# URLs de servicios
USER_SERVICE_URL=http://localhost:3001
PROPERTY_SERVICE_URL=http://localhost:3002
SEARCH_SERVICE_URL=http://localhost:3003
CHAT_SERVICE_URL=http://localhost:3004
```

## 📋 Plan de Implementación

### Fase 1: Infraestructura Base (Días 1-2)
1. **Setup inicial de proyectos NestJS**
   - Configurar estructura de cada microservicio
   - Setup de TypeScript, ESLint, Prettier
   - Configurar Docker para cada servicio

2. **API Gateway**
   - Express.js con TypeScript
   - Middleware de autenticación
   - Proxy a microservicios
   - Rate limiting básico

3. **Base de datos**
   - Scripts de inicialización PostgreSQL
   - Configuración MongoDB
   - Setup Redis
   - Configuración Elasticsearch

### Fase 2: User Service (Días 3-4)
1. **Autenticación completa**
   - Registro de usuarios
   - Login con JWT
   - Refresh tokens
   - Middleware de autorización

2. **Gestión de usuarios**
   - CRUD de perfiles
   - Gestión de roles
   - Verificación de email
   - Recuperación de contraseñas

### Fase 3: Property Service (Días 5-7)
1. **CRUD de propiedades**
   - Crear, leer, actualizar, eliminar
   - Validaciones completas
   - Geolocalización con PostGIS

2. **Gestión de imágenes**
   - Upload a AWS S3
   - Redimensionamiento automático
   - Gestión de metadatos

3. **Favoritos y estadísticas**
   - Sistema de favoritos
   - Analytics básicas

### Fase 4: Search Service (Días 8-9)
1. **Indexación Elasticsearch**
   - Sincronización con PostgreSQL
   - Mapeo de campos
   - Indexación automática

2. **Búsqueda avanzada**
   - Filtros múltiples
   - Búsqueda geográfica
   - Autocompletado
   - Ranking por relevancia

### Fase 5: Chat Service (Días 10-11)
1. **WebSocket setup**
   - Socket.io configuración
   - Autenticación de sockets
   - Rooms por conversación

2. **Mensajería**
   - Envío/recepción en tiempo real
   - Historial persistente
   - Estados de mensajes
   - Notificaciones

### Fase 6: Integración y Testing (Días 12-14)
1. **Integración completa**
   - Conectar todos los servicios
   - Testing end-to-end
   - Optimización de performance

2. **Documentación**
   - Swagger/OpenAPI
   - README de cada servicio
   - Guías de deployment

## 🧪 Estrategia de Testing

### Unit Tests
- **Coverage mínimo**: 80%
- **Framework**: Jest + Supertest
- **Mocking**: Bases de datos y servicios externos

### Integration Tests
- **Database testing**: Test containers
- **API testing**: Postman collections
- **WebSocket testing**: Socket.io client

### E2E Tests
- **Scenarios completos**: Registro → Login → CRUD → Chat
- **Performance testing**: Artillery.js
- **Load testing**: k6

## 🚀 Deployment Strategy

### Development
```bash
# Levantar todos los servicios
docker-compose up -d

# Desarrollo individual
cd backend/user-service
npm run dev
```

### Production
- **Kubernetes** para orquestación
- **Helm charts** para deployment
- **CI/CD** con GitHub Actions
- **Monitoring** con Prometheus + Grafana

## 📊 Monitoring y Observabilidad

### Logging
- **Winston** para logging estructurado
- **ELK Stack** para agregación
- **Correlation IDs** para tracing

### Metrics
- **Prometheus** para métricas
- **Grafana** para visualización
- **Health checks** en todos los servicios

### Alerting
- **PagerDuty** para alertas críticas
- **Slack** para notificaciones
- **SLA monitoring** 99.9% uptime

## 🔒 Seguridad

### Autenticación
- **JWT** con refresh tokens
- **Rate limiting** por IP y usuario
- **Password hashing** con bcrypt

### Autorización
- **RBAC** (Role-Based Access Control)
- **Resource-level permissions**
- **API key management**

### Data Protection
- **Encryption at rest** (PostgreSQL TDE)
- **Encryption in transit** (TLS 1.3)
- **PII anonymization** en logs

## 📈 Escalabilidad

### Horizontal Scaling
- **Stateless services** para fácil scaling
- **Load balancing** con NGINX
- **Database sharding** cuando sea necesario

### Caching Strategy
- **Redis** para cache de aplicación
- **CDN** para assets estáticos
- **Query optimization** con índices

### Performance Targets
- **Response time**: < 200ms (95th percentile)
- **Throughput**: 1000 RPS por servicio
- **Availability**: 99.9% uptime

## 🎯 Próximos Pasos

1. **Implementar Fase 1**: Setup de infraestructura
2. **Crear User Service**: Autenticación completa
3. **Desarrollar Property Service**: CRUD con geolocalización
4. **Integrar Search Service**: Elasticsearch + filtros
5. **Implementar Chat Service**: WebSockets + tiempo real
6. **Testing completo**: Unit + Integration + E2E
7. **Documentación**: APIs + deployment guides
8. **Production deployment**: Kubernetes + monitoring

---

## 📞 Contacto del Equipo

Para preguntas sobre la implementación del backend, contactar al equipo de desarrollo.

**Última actualización**: 2024-01-20
**Versión del documento**: 1.0
**Estado**: En desarrollo activo
