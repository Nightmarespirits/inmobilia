# Guía Completa de Configuración de Supabase para PropTech Nexus

Esta guía te llevará paso a paso para configurar una instancia de Supabase completamente funcional para el proyecto PropTech Nexus.

## 📋 Requisitos Previos

- Cuenta de GitHub (para autenticación con Supabase)
- Navegador web moderno
- Acceso a internet

## 🚀 Paso 1: Crear Cuenta y Proyecto en Supabase

### 1.1 Registro en Supabase
1. Ve a [supabase.com](https://supabase.com)
2. Haz clic en "Start your project"
3. Inicia sesión con GitHub
4. Autoriza la aplicación Supabase

### 1.2 Crear Nuevo Proyecto
1. En el dashboard, haz clic en "New Project"
2. Selecciona tu organización (o crea una nueva)
3. Completa la información del proyecto:
   - **Name**: `proptech-nexus`
   - **Database Password**: Genera una contraseña segura (¡guárdala!)
   - **Region**: Selecciona la más cercana a tu ubicación
   - **Pricing Plan**: Free (para desarrollo)
4. Haz clic en "Create new project"
5. Espera 2-3 minutos mientras se configura la base de datos

## 🗄️ Paso 2: Configurar la Base de Datos

### 2.1 Ejecutar el Schema SQL
1. En el dashboard de Supabase, ve a la sección **SQL Editor**
2. Haz clic en "New query"
3. Copia y pega todo el contenido del archivo `supabase-schema.sql`
4. Haz clic en "Run" para ejecutar el script
5. Verifica que no haya errores en la consola

### 2.2 Verificar las Tablas Creadas
1. Ve a la sección **Table Editor**
2. Deberías ver las siguientes tablas:
   - `profiles`
   - `properties`
   - `favorites`
   - `conversations`
   - `messages`

## 🔐 Paso 3: Configurar Autenticación

### 3.1 Configurar Proveedores de Autenticación
1. Ve a **Authentication > Settings**
2. En la sección "Auth Providers":
   - **Email**: Ya está habilitado por defecto
   - Opcionalmente, puedes habilitar Google, GitHub, etc.

### 3.2 Configurar URLs de Redirección
1. En **Authentication > URL Configuration**:
   - **Site URL**: `http://localhost:3000` (para desarrollo)
   - **Redirect URLs**: Agregar:
     - `http://localhost:3000/auth/callback`
     - `http://localhost:3000/auth/reset-password`

### 3.3 Configurar Plantillas de Email (Opcional)
1. Ve a **Authentication > Email Templates**
2. Personaliza las plantillas según tu marca:
   - Confirm signup
   - Reset password
   - Magic link

## 🔑 Paso 4: Obtener las Claves de API

### 4.1 Encontrar las Claves
1. Ve a **Settings > API**
2. Copia las siguientes claves:
   - **Project URL**: `https://tu-proyecto.supabase.co`
   - **anon public**: `eyJ...` (clave pública)
   - **service_role**: `eyJ...` (clave privada - ¡mantén segura!)

### 4.2 Configurar Variables de Entorno
1. En tu proyecto, copia el archivo `.env.example` a `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edita el archivo `.env` y actualiza las variables de Supabase:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...tu-clave-publica...
   SUPABASE_SERVICE_ROLE_KEY=eyJ...tu-clave-privada...
   ```

## 📊 Paso 5: Configurar Storage (Opcional)

### 5.1 Crear Bucket para Imágenes
1. Ve a **Storage**
2. Haz clic en "Create bucket"
3. Nombre: `property-images`
4. Configuración:
   - **Public bucket**: ✅ Habilitado
   - **File size limit**: 10 MB
   - **Allowed MIME types**: `image/*`

### 5.2 Configurar Políticas de Storage
```sql
-- Política para permitir subida de imágenes a usuarios autenticados
CREATE POLICY "Los usuarios autenticados pueden subir imágenes" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'property-images' AND 
  auth.role() = 'authenticated'
);

-- Política para permitir lectura pública de imágenes
CREATE POLICY "Las imágenes son públicamente visibles" ON storage.objects
FOR SELECT USING (bucket_id = 'property-images');
```

## 🧪 Paso 6: Probar la Configuración

### 6.1 Verificar Conexión desde el Frontend
1. Inicia el servidor de desarrollo:
   ```bash
   cd frontend
   npm run dev
   ```

2. Abre el navegador en `http://localhost:3000`
3. Intenta registrar un nuevo usuario
4. Verifica que el perfil se cree en la tabla `profiles`

### 6.2 Probar Funcionalidades Básicas
1. **Registro de usuario**: Crear cuenta nueva
2. **Login**: Iniciar sesión con credenciales
3. **Perfil**: Actualizar información del usuario
4. **Propiedades**: Crear una propiedad de prueba (como agente)
5. **Favoritos**: Agregar/quitar favoritos

## 🔧 Paso 7: Configuraciones Adicionales

### 7.1 Configurar Realtime (Para Chat)
1. Ve a **Settings > API**
2. En la sección "Realtime", asegúrate de que esté habilitado
3. Las tablas `conversations` y `messages` ya están configuradas para realtime

### 7.2 Configurar Webhooks (Opcional)
Para notificaciones o integraciones externas:
1. Ve a **Database > Webhooks**
2. Crea webhooks para eventos específicos:
   - Nuevo usuario registrado
   - Nueva propiedad creada
   - Nuevo mensaje enviado

### 7.3 Configurar Edge Functions (Opcional)
Para lógica de servidor personalizada:
1. Ve a **Edge Functions**
2. Puedes crear funciones para:
   - Procesamiento de imágenes
   - Notificaciones push
   - Integraciones con APIs externas

## 📈 Paso 8: Monitoreo y Analíticas

### 8.1 Configurar Logs
1. Ve a **Logs**
2. Monitorea:
   - **API Logs**: Requests y responses
   - **Database Logs**: Queries y errores
   - **Auth Logs**: Intentos de login y registro

### 8.2 Configurar Alertas
1. Ve a **Settings > Billing**
2. Configura alertas para:
   - Uso de base de datos
   - Número de usuarios activos
   - Ancho de banda

## 🚀 Paso 9: Despliegue a Producción

### 9.1 Actualizar URLs de Producción
1. Cuando despliegues a producción, actualiza:
   - **Site URL** en Authentication Settings
   - **Redirect URLs** para incluir tu dominio de producción
   - Variables de entorno en tu plataforma de hosting

### 9.2 Configurar Dominio Personalizado (Opcional)
1. Ve a **Settings > Custom Domains**
2. Configura tu dominio personalizado para la API de Supabase

## 🔒 Paso 10: Seguridad y Mejores Prácticas

### 10.1 Revisar Políticas RLS
- Todas las tablas tienen Row Level Security habilitado
- Las políticas están configuradas para máxima seguridad
- Revisa y ajusta según tus necesidades específicas

### 10.2 Configurar Rate Limiting
```sql
-- Ejemplo de rate limiting para prevenir spam
CREATE OR REPLACE FUNCTION check_rate_limit(user_id UUID, action_type TEXT, max_requests INTEGER, time_window INTERVAL)
RETURNS BOOLEAN AS $$
DECLARE
    request_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO request_count
    FROM user_actions
    WHERE user_id = user_id
      AND action_type = action_type
      AND created_at > NOW() - time_window;
    
    RETURN request_count < max_requests;
END;
$$ LANGUAGE plpgsql;
```

### 10.3 Backup y Recuperación
1. Ve a **Settings > Database**
2. Configura backups automáticos
3. Descarga backups regulares para desarrollo local

## 🎯 Datos de Prueba

Para facilitar el desarrollo, puedes insertar datos de prueba:

```sql
-- Usuarios de prueba (ejecutar después del registro manual)
UPDATE profiles SET role = 'agent' WHERE email = 'agente@test.com';

-- Propiedades de prueba
INSERT INTO properties (title, description, price, type, bedrooms, bathrooms, area, location, address, agent_id, images, features) VALUES
('Casa Moderna en La Molina', 'Hermosa casa con acabados de primera', 450000, 'house', 3, 2, 180, 'La Molina, Lima', 'Av. La Molina 123', (SELECT id FROM profiles WHERE role = 'agent' LIMIT 1), ARRAY['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800'], ARRAY['Piscina', 'Jardín', 'Garaje']),
('Departamento en San Isidro', 'Moderno departamento con vista al mar', 2800, 'apartment', 2, 2, 95, 'San Isidro, Lima', 'Av. Conquistadores 456', (SELECT id FROM profiles WHERE role = 'agent' LIMIT 1), ARRAY['https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800'], ARRAY['Vista al mar', 'Gimnasio', 'Seguridad 24h']);
```

## ✅ Checklist Final

- [ ] Proyecto Supabase creado
- [ ] Schema SQL ejecutado correctamente
- [ ] Tablas creadas y verificadas
- [ ] Autenticación configurada
- [ ] Variables de entorno configuradas
- [ ] Storage configurado (opcional)
- [ ] Conexión desde frontend probada
- [ ] Registro y login funcionando
- [ ] CRUD de propiedades funcionando
- [ ] Sistema de favoritos funcionando
- [ ] Chat básico funcionando
- [ ] Políticas de seguridad revisadas

## 🆘 Solución de Problemas Comunes

### Error: "Invalid API key"
- Verifica que las variables de entorno estén correctamente configuradas
- Asegúrate de usar la clave `anon` para el frontend

### Error: "Row Level Security"
- Verifica que las políticas RLS estén configuradas correctamente
- Asegúrate de que el usuario esté autenticado

### Error: "Function not found"
- Verifica que todas las funciones SQL se hayan ejecutado correctamente
- Revisa los logs de la base de datos para errores específicos

### Problemas de Realtime
- Verifica que Realtime esté habilitado en el proyecto
- Asegúrate de que las tablas estén configuradas para replicación

## 📚 Recursos Adicionales

- [Documentación oficial de Supabase](https://supabase.com/docs)
- [Guías de Supabase](https://supabase.com/docs/guides)
- [Ejemplos de código](https://github.com/supabase/supabase/tree/master/examples)
- [Comunidad de Supabase](https://github.com/supabase/supabase/discussions)

---

¡Con esta configuración tendrás un backend completamente funcional para PropTech Nexus usando Supabase! 🎉
