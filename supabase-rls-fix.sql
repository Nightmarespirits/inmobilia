-- Fix para el error RLS en profiles
-- Agregar política INSERT faltante para permitir creación de perfiles

-- Política para permitir que los usuarios creen su propio perfil
CREATE POLICY "Los usuarios pueden crear su propio perfil" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Política para permitir que los usuarios eliminen su propio perfil (opcional)
CREATE POLICY "Los usuarios pueden eliminar su propio perfil" ON public.profiles
    FOR DELETE USING (auth.uid() = id);

-- Verificar que el trigger para crear perfiles automáticamente esté funcionando
-- Si no existe, crearlo:
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, phone)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE(new.raw_user_meta_data->>'role', 'buyer'),
    COALESCE(new.raw_user_meta_data->>'phone', '')
  );
  RETURN new;
END;
$$ language plpgsql security definer;

-- Recrear el trigger si no existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
