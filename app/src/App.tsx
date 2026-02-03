import { useEffect, useState } from 'react'
import './App.css'
import { supabase } from '../supabaseClient.ts';
import type { Session } from '@supabase/supabase-js';
import LoginPage from './components/LoginPage.tsx';
import Dashboard from './components/Dashboard.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import { Toaster } from 'sonner';

function App() {
  const [session, setSession] = useState<Session | null>(null); // Session can either be a Supabase Session object(when logged in) or null (when logged out)
  const [loading, setLoading] = useState(true);
  const [needsName, setNeedsName] = useState(false);  

useEffect(() => {
  supabase.auth.getSession().then(({ data: { session } }) => {
    setSession(session);
    setLoading(false);

    if (session?.user) {
      const fullName = session?.user?.user_metadata?.full_name ?? '';
      if (!fullName) {
        setNeedsName(true);
      } else {
        const [fName, lName] = fullName.split(' ');
        supabase.from("profiles").upsert({
          id: session?.user?.id,
          first_name: fName || '',
          last_name: lName || '',
        })
      }
    }
  });

  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    setSession(session);
  });

  return () => subscription.unsubscribe();
}, []);

useEffect(() => {
  if (session?.user && !session?.user?.user_metadata.full_name) {
    setNeedsName(true);
  }
}, [session])

  const signOut = async () => {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return;
    } else {
      await supabase.auth.signOut();
      setSession(null)
    }
  }  

  if (loading) {
    return (
      <div>Signing you in...</div>
    )
  }

  if (needsName && session) {
    return <LoginPage needsName={needsName} session={session} onSave={() => setNeedsName(false)} />
  }
  
  if (!session) {
    return <LoginPage needsName={false} session={null} onSave={() => {}} />
  }

  return (
    <ErrorBoundary>
      <Toaster position='top-right'/>
    <Dashboard session={session} signOut={signOut}/>
    </ErrorBoundary>
  );
}

export default App
