import { ThemeSupa } from '@supabase/auth-ui-shared'
import { Auth } from '@supabase/auth-ui-react';
import { supabase } from '../../supabaseClient';
import heroImage from '../assets/DebtMate_home-image.png';
import type { Session } from '@supabase/supabase-js';
import NamePrompt from './ui/NamePrompt';

interface LoginPageProps {
  needsName: boolean
  session: Session | null
  onSave: () => void
}

function LoginPage({ needsName, session, onSave }: LoginPageProps) {
  
  return (
  <div className="flex items-center justify-center min-h-screen">
    {needsName ? (
      <div className="w-full max-w-md p-6">
        <div className="mb-6 text-center md:hidden">
          <h1 className="text-5xl font-extrabold text-gray-800 cal-sans">
            DebtMates
          </h1>
          <p className="text-lg text-gray-600 max-w-md mx-auto">
            Request. Confirm. Settle.
          </p>
        </div>
        <NamePrompt session={session!} onSave={onSave} />
      </div> 
    ):(
      <div className="w-full max-w-md p-6">
        <div className="mb-6 text-center md:hidden">
          <h1 className="text-5xl font-extrabold text-gray-800 cal-sans">
            DebtMates
          </h1>
          <p className="text-lg text-gray-600 max-w-md mx-auto">
            Request. Confirm. Settle.
          </p>
        </div>
        <Auth
          supabaseClient={supabase}
          providers={['google']}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: 'orange',
                  brandAccent: 'darkorange',
                },
              },
            },
          }}
        />
      </div>
    )}

    <div className="flex-1 hidden md:flex flex-col justify-start items-center px-12 text-center">
      <h1 className="text-6xl font-extrabold mb-2 text-gray-800 cal-sans">
        DebtMates
      </h1>
      <p className="text-lg mb-8 text-gray-600 max-w-md">
        Request. Confirm. Settle.
      </p>
      <img src={heroImage} alt="Welcome" className="max-w-full max-h-88 object-contain rounded-xl" />
    </div>
  </div>
)
}

export default LoginPage

