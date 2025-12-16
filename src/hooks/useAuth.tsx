import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface SubscriptionState {
  subscribed: boolean;
  trial: boolean;
  trialEnd: string | null;
  subscriptionEnd: string | null;
  loading: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  subscription: SubscriptionState;
  signUp: (phone: string, pin: string, metadata?: { full_name?: string; phone?: string }) => Promise<{ error: Error | null }>;
  signIn: (phone: string, pin: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  checkSubscription: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Convert phone to a valid email format for Supabase auth
const phoneToEmail = (phone: string) => `${phone}@mtsango.local`;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionState>({
    subscribed: false,
    trial: false,
    trialEnd: null,
    subscriptionEnd: null,
    loading: true,
  });

  const checkSubscription = async () => {
    if (!session?.access_token) {
      setSubscription({
        subscribed: false,
        trial: false,
        trialEnd: null,
        subscriptionEnd: null,
        loading: false,
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke("check-subscription", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error("Error checking subscription:", error);
        setSubscription(prev => ({ ...prev, loading: false }));
        return;
      }

      setSubscription({
        subscribed: data.subscribed || false,
        trial: data.trial || false,
        trialEnd: data.trial_end || null,
        subscriptionEnd: data.subscription_end || null,
        loading: false,
      });
    } catch (error) {
      console.error("Error checking subscription:", error);
      setSubscription(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Check subscription after auth state change
        if (session) {
          setTimeout(() => {
            checkSubscription();
          }, 0);
        } else {
          setSubscription({
            subscribed: false,
            trial: false,
            trialEnd: null,
            subscriptionEnd: null,
            loading: false,
          });
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (session) {
        setTimeout(() => {
          checkSubscription();
        }, 0);
      } else {
        setSubscription(prev => ({ ...prev, loading: false }));
      }
    });

    return () => authSubscription.unsubscribe();
  }, []);

  // Refresh subscription check every minute
  useEffect(() => {
    if (!session) return;
    
    const interval = setInterval(() => {
      checkSubscription();
    }, 60000);

    return () => clearInterval(interval);
  }, [session]);

  const signUp = async (phone: string, pin: string, metadata?: { full_name?: string; phone?: string }) => {
    const email = phoneToEmail(phone);
    const redirectUrl = `${window.location.origin}/dashboard`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password: pin,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          ...metadata,
          phone: metadata?.phone || phone
        }
      }
    });
    return { error };
  };

  const signIn = async (phone: string, pin: string) => {
    const email = phoneToEmail(phone);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: pin
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, subscription, signUp, signIn, signOut, checkSubscription }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
