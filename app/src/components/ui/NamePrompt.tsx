import { useState } from 'react';
import { supabase } from '../../../supabaseClient';
import type { Session } from '@supabase/supabase-js';

interface NamePromptProps {
  session: Session;
  onSave: () => void;
}

export default function NamePrompt({ session, onSave }: NamePromptProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!firstName || !lastName) return;

    setLoading(true);

    const { error: metaError } = await supabase.auth.updateUser({
      data: { full_name: `${firstName} ${lastName}` }
    });

    if (metaError) {
      console.error('Error updating user metadata:', metaError);
      setLoading(false);
      return;
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: session.user.id,
        first_name: firstName,
        last_name: lastName,
      });

    if (profileError) {
      console.error('Error upserting profile:', profileError);
      setLoading(false);
      return;
    }

    setLoading(false);
    onSave(); // notify parent App that name is set
  };

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-medium text-gray-700">
        Welcome! Please enter your name
      </h2>
      <input
        placeholder="First Name"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        className="border px-3 py-2 rounded focus:outline-none focus:border-orange-400"
      />
      <input
        placeholder="Last Name"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
        className="border px-3 py-2 rounded focus:outline-none focus:border-orange-400"
      />
      <button
        onClick={handleSave}
        disabled={loading || !firstName.trim() || !lastName.trim()}
        className="bg-orange-500 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? 'Saving...' : 'Save'}
      </button>
    </div>
  );
}
