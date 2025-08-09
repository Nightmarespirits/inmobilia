-- PropTech Nexus - Supabase Database Schema
-- Este archivo contiene todas las tablas y configuraciones necesarias para el proyecto

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Tabla de perfiles de usuario (extiende auth.users)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT NOT NULL CHECK (role IN ('buyer', 'agent', 'admin')) DEFAULT 'buyer',
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de propiedades
CREATE TABLE public.properties (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    price DECIMAL(12,2) NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('apartment', 'house', 'commercial', 'land')),
    status TEXT NOT NULL CHECK (status IN ('available', 'sold', 'rented', 'pending')) DEFAULT 'available',
    bedrooms INTEGER DEFAULT 0,
    bathrooms INTEGER DEFAULT 0,
    area DECIMAL(10,2) NOT NULL,
    location TEXT NOT NULL,
    address TEXT NOT NULL,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    images TEXT[] DEFAULT '{}',
    features TEXT[] DEFAULT '{}',
    agent_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de favoritos
CREATE TABLE public.favorites (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, property_id)
);

-- Tabla de conversaciones
CREATE TABLE public.conversations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    participants UUID[] NOT NULL,
    property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
    last_message TEXT,
    last_message_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de mensajes
CREATE TABLE public.messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar el rendimiento
CREATE INDEX idx_properties_agent_id ON public.properties(agent_id);
CREATE INDEX idx_properties_status ON public.properties(status);
CREATE INDEX idx_properties_type ON public.properties(type);
CREATE INDEX idx_properties_price ON public.properties(price);
CREATE INDEX idx_properties_location ON public.properties USING gin(to_tsvector('spanish', location));
CREATE INDEX idx_properties_title ON public.properties USING gin(to_tsvector('spanish', title));
CREATE INDEX idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX idx_favorites_property_id ON public.favorites(property_id);
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX idx_conversations_participants ON public.conversations USING gin(participants);

-- Índice geoespacial para búsquedas por ubicación
CREATE INDEX idx_properties_location_geo ON public.properties USING gist(ST_Point(longitude, latitude));

-- Función para buscar propiedades cercanas
CREATE OR REPLACE FUNCTION get_nearby_properties(lat DECIMAL, lng DECIMAL, radius_km DECIMAL DEFAULT 5)
RETURNS TABLE (
    id UUID,
    title TEXT,
    description TEXT,
    price DECIMAL,
    type TEXT,
    status TEXT,
    bedrooms INTEGER,
    bathrooms INTEGER,
    area DECIMAL,
    location TEXT,
    address TEXT,
    latitude DECIMAL,
    longitude DECIMAL,
    images TEXT[],
    features TEXT[],
    agent_id UUID,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    distance_km DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.*,
        ROUND(
            ST_Distance(
                ST_Point(lng, lat)::geography,
                ST_Point(p.longitude, p.latitude)::geography
            ) / 1000, 2
        ) as distance_km
    FROM public.properties p
    WHERE p.latitude IS NOT NULL 
      AND p.longitude IS NOT NULL
      AND p.status = 'available'
      AND ST_DWithin(
          ST_Point(lng, lat)::geography,
          ST_Point(p.longitude, p.latitude)::geography,
          radius_km * 1000
      )
    ORDER BY distance_km;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_properties_updated_at
    BEFORE UPDATE ON public.properties
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Función para crear perfil automáticamente cuando se registra un usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role, phone)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        COALESCE(NEW.raw_user_meta_data->>'role', 'buyer'),
        NEW.raw_user_meta_data->>'phone'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear perfil automáticamente
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Políticas de seguridad (Row Level Security)

-- Habilitar RLS en todas las tablas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Los usuarios pueden ver todos los perfiles públicos" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Los usuarios pueden actualizar su propio perfil" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Políticas para properties
CREATE POLICY "Todos pueden ver propiedades disponibles" ON public.properties
    FOR SELECT USING (status = 'available' OR agent_id = auth.uid());

CREATE POLICY "Los agentes pueden crear propiedades" ON public.properties
    FOR INSERT WITH CHECK (
        auth.uid() = agent_id AND
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('agent', 'admin')
        )
    );

CREATE POLICY "Los agentes pueden actualizar sus propiedades" ON public.properties
    FOR UPDATE USING (
        auth.uid() = agent_id AND
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('agent', 'admin')
        )
    );

CREATE POLICY "Los agentes pueden eliminar sus propiedades" ON public.properties
    FOR DELETE USING (
        auth.uid() = agent_id AND
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('agent', 'admin')
        )
    );

-- Políticas para favorites
CREATE POLICY "Los usuarios pueden ver sus propios favoritos" ON public.favorites
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden agregar favoritos" ON public.favorites
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden eliminar sus favoritos" ON public.favorites
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas para conversations
CREATE POLICY "Los usuarios pueden ver sus conversaciones" ON public.conversations
    FOR SELECT USING (auth.uid() = ANY(participants));

CREATE POLICY "Los usuarios pueden crear conversaciones" ON public.conversations
    FOR INSERT WITH CHECK (auth.uid() = ANY(participants));

CREATE POLICY "Los usuarios pueden actualizar sus conversaciones" ON public.conversations
    FOR UPDATE USING (auth.uid() = ANY(participants));

-- Políticas para messages
CREATE POLICY "Los usuarios pueden ver mensajes de sus conversaciones" ON public.messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.conversations 
            WHERE id = conversation_id AND auth.uid() = ANY(participants)
        )
    );

CREATE POLICY "Los usuarios pueden enviar mensajes" ON public.messages
    FOR INSERT WITH CHECK (
        auth.uid() = sender_id AND
        EXISTS (
            SELECT 1 FROM public.conversations 
            WHERE id = conversation_id AND auth.uid() = ANY(participants)
        )
    );

CREATE POLICY "Los usuarios pueden actualizar sus mensajes" ON public.messages
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.conversations 
            WHERE id = conversation_id AND auth.uid() = ANY(participants)
        )
    );

-- Insertar datos de ejemplo (opcional)
INSERT INTO public.profiles (id, email, full_name, role, phone) VALUES
    ('00000000-0000-0000-0000-000000000001', 'demo.buyer@proptechnexus.com', 'Juan Pérez', 'buyer', '+51 999 888 777'),
    ('00000000-0000-0000-0000-000000000002', 'demo.agent@proptechnexus.com', 'María García', 'agent', '+51 999 777 666')
ON CONFLICT (id) DO NOTHING;

-- Comentarios para documentación
COMMENT ON TABLE public.profiles IS 'Perfiles de usuario que extienden la tabla auth.users de Supabase';
COMMENT ON TABLE public.properties IS 'Propiedades inmobiliarias con información completa y geolocalización';
COMMENT ON TABLE public.favorites IS 'Relación muchos a muchos entre usuarios y propiedades favoritas';
COMMENT ON TABLE public.conversations IS 'Conversaciones entre usuarios, opcionalmente relacionadas con una propiedad';
COMMENT ON TABLE public.messages IS 'Mensajes individuales dentro de las conversaciones';
COMMENT ON FUNCTION get_nearby_properties IS 'Función para buscar propiedades cercanas a una ubicación específica';
