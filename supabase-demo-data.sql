-- Script para insertar datos demo en Supabase
-- Ejecutar después de crear la estructura con supabase-schema.sql

-- Insertar perfiles demo (estos IDs deben coincidir con usuarios reales de Supabase Auth)
-- NOTA: Cambiar los UUIDs por los IDs reales de tus usuarios de Supabase

-- Ejemplo de inserción de propiedades demo
-- Primero, obtén el ID de tu usuario agente desde la tabla profiles
-- SELECT id FROM profiles WHERE role = 'agent' LIMIT 1;

-- Insertar propiedades demo (reemplaza 'agent-uuid-aqui' con el ID real del agente)
INSERT INTO public.properties (
  title, description, price, type, bedrooms, bathrooms, area, 
  location, address, latitude, longitude, images, features, 
  agent_id, status
) VALUES 
(
  'Casa Moderna en La Molina',
  'Hermosa casa con acabados de primera calidad, ubicada en una de las mejores zonas de La Molina. Cuenta con amplios espacios, jardín privado y excelente ubicación cerca de centros comerciales y colegios.',
  450000,
  'house',
  3,
  2,
  180,
  'La Molina, Lima',
  'Av. La Molina 123',
  -12.0464,
  -77.0428,
  ARRAY['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800', 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800'],
  ARRAY['Piscina', 'Jardín', 'Garaje', 'Seguridad 24h'],
  (SELECT id FROM profiles WHERE role = 'agent' LIMIT 1),
  'available'
),
(
  'Departamento en San Isidro',
  'Moderno departamento con vista al mar y acabados de lujo. Ubicado en el corazón de San Isidro, cerca de parques, restaurantes y centros financieros.',
  2800,
  'apartment',
  2,
  2,
  95,
  'San Isidro, Lima',
  'Av. Conquistadores 456',
  -12.0972,
  -77.0364,
  ARRAY['https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'],
  ARRAY['Vista al mar', 'Gimnasio', 'Seguridad 24h', 'Ascensor'],
  (SELECT id FROM profiles WHERE role = 'agent' LIMIT 1),
  'available'
),
(
  'Oficina en Miraflores',
  'Espaciosa oficina en el distrito más comercial de Lima. Ideal para empresas que buscan prestigio y ubicación estratégica.',
  3500,
  'office',
  0,
  2,
  120,
  'Miraflores, Lima',
  'Av. Larco 789',
  -12.1211,
  -77.0269,
  ARRAY['https://images.unsplash.com/photo-1497366216548-37526070297c?w=800'],
  ARRAY['Aire acondicionado', 'Internet fibra óptica', 'Estacionamiento', 'Recepción'],
  (SELECT id FROM profiles WHERE role = 'agent' LIMIT 1),
  'available'
),
(
  'Loft Industrial en Barranco',
  'Moderno loft con estilo industrial en el bohemio distrito de Barranco. Perfecto para artistas y profesionales creativos.',
  320000,
  'loft',
  2,
  2,
  95,
  'Barranco, Lima',
  'Av. Grau 321',
  -12.1464,
  -77.0206,
  ARRAY['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'],
  ARRAY['Techos altos', 'Estilo industrial', 'Terraza', 'Cerca al malecón'],
  (SELECT id FROM profiles WHERE role = 'agent' LIMIT 1),
  'available'
);

-- Insertar favoritos demo (reemplaza 'buyer-uuid-aqui' con el ID real del comprador)
INSERT INTO public.favorites (user_id, property_id) VALUES 
(
  (SELECT id FROM profiles WHERE role = 'buyer' LIMIT 1),
  (SELECT id FROM properties WHERE title = 'Casa Moderna en La Molina' LIMIT 1)
),
(
  (SELECT id FROM profiles WHERE role = 'buyer' LIMIT 1),
  (SELECT id FROM properties WHERE title = 'Departamento en San Isidro' LIMIT 1)
);

-- Insertar conversación demo
INSERT INTO public.conversations (buyer_id, agent_id, property_id, status) VALUES 
(
  (SELECT id FROM profiles WHERE role = 'buyer' LIMIT 1),
  (SELECT id FROM profiles WHERE role = 'agent' LIMIT 1),
  (SELECT id FROM properties WHERE title = 'Casa Moderna en La Molina' LIMIT 1),
  'active'
);

-- Insertar mensajes demo
INSERT INTO public.messages (conversation_id, sender_id, content) VALUES 
(
  (SELECT id FROM conversations LIMIT 1),
  (SELECT id FROM profiles WHERE role = 'buyer' LIMIT 1),
  'Hola, me interesa esta propiedad. ¿Podríamos agendar una visita?'
),
(
  (SELECT id FROM conversations LIMIT 1),
  (SELECT id FROM profiles WHERE role = 'agent' LIMIT 1),
  '¡Por supuesto! ¿Qué día te viene mejor? Tengo disponibilidad mañana por la tarde o el viernes por la mañana.'
),
(
  (SELECT id FROM conversations LIMIT 1),
  (SELECT id FROM profiles WHERE role = 'buyer' LIMIT 1),
  'El viernes por la mañana me viene perfecto. ¿A las 10:00 AM está bien?'
);

-- Verificar que los datos se insertaron correctamente
SELECT 'Propiedades insertadas:' as info, COUNT(*) as count FROM properties;
SELECT 'Favoritos insertados:' as info, COUNT(*) as count FROM favorites;
SELECT 'Conversaciones insertadas:' as info, COUNT(*) as count FROM conversations;
SELECT 'Mensajes insertados:' as info, COUNT(*) as count FROM messages;
