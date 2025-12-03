-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  avatar_url TEXT,
  pin_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Create tontines table
CREATE TABLE public.tontines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('weekly', 'biweekly', 'monthly')),
  total_members INTEGER NOT NULL DEFAULT 2,
  start_date DATE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on tontines
ALTER TABLE public.tontines ENABLE ROW LEVEL SECURITY;

-- Tontines policies
CREATE POLICY "Users can view their own tontines" ON public.tontines FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own tontines" ON public.tontines FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own tontines" ON public.tontines FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own tontines" ON public.tontines FOR DELETE USING (auth.uid() = user_id);

-- Create tontine_members table
CREATE TABLE public.tontine_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tontine_id UUID NOT NULL REFERENCES public.tontines(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  position INTEGER NOT NULL DEFAULT 1,
  is_current_user BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on tontine_members
ALTER TABLE public.tontine_members ENABLE ROW LEVEL SECURITY;

-- Members policies (via tontine ownership)
CREATE POLICY "Users can view members of their tontines" ON public.tontine_members 
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.tontines WHERE id = tontine_id AND user_id = auth.uid())
  );
CREATE POLICY "Users can add members to their tontines" ON public.tontine_members 
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.tontines WHERE id = tontine_id AND user_id = auth.uid())
  );
CREATE POLICY "Users can update members of their tontines" ON public.tontine_members 
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.tontines WHERE id = tontine_id AND user_id = auth.uid())
  );
CREATE POLICY "Users can delete members from their tontines" ON public.tontine_members 
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.tontines WHERE id = tontine_id AND user_id = auth.uid())
  );

-- Create contributions table
CREATE TABLE public.contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tontine_id UUID NOT NULL REFERENCES public.tontines(id) ON DELETE CASCADE,
  from_member_id UUID NOT NULL REFERENCES public.tontine_members(id) ON DELETE CASCADE,
  to_member_id UUID NOT NULL REFERENCES public.tontine_members(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'received')),
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on contributions
ALTER TABLE public.contributions ENABLE ROW LEVEL SECURITY;

-- Contributions policies (via tontine ownership)
CREATE POLICY "Users can view contributions of their tontines" ON public.contributions 
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.tontines WHERE id = tontine_id AND user_id = auth.uid())
  );
CREATE POLICY "Users can create contributions in their tontines" ON public.contributions 
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.tontines WHERE id = tontine_id AND user_id = auth.uid())
  );
CREATE POLICY "Users can update contributions in their tontines" ON public.contributions 
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.tontines WHERE id = tontine_id AND user_id = auth.uid())
  );
CREATE POLICY "Users can delete contributions from their tontines" ON public.contributions 
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.tontines WHERE id = tontine_id AND user_id = auth.uid())
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tontines_updated_at BEFORE UPDATE ON public.tontines FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'phone', '')
  );
  RETURN NEW;
END;
$$;

-- Trigger to auto-create profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();