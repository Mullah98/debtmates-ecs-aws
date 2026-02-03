import type { Session } from '@supabase/supabase-js';
import DebtChart from './ui/DebtChart';
import DebtForm, { type Debt } from './ui/DebtForm';
import DebtTable from './ui/DebtTable';
import { motion } from 'framer-motion';
import { supabase } from '../../supabaseClient';
import { useEffect, useState } from 'react';
import DebtNotification from './ui/DebtNotification';
import SettingsTab from './ui/SettingsTab';
import DefaultAvatar from '../assets/default_avatar.png';

interface DashboardProps {
  session: Session | null
  signOut: () => void
}

export interface User {
  id: string
  friend_id?: string
  first_name: string
  last_name: string
  avatar_url?: string | undefined
}

function Dashboard({ session, signOut }: DashboardProps) {
  const greeting: string = `Welcome back, ${session?.user?.user_metadata?.full_name?.split(" ")[0]}`
  const [allDebts, setAllDebts] = useState<Debt[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [userAvatar, setUserAvatar] = useState<string>();
  const [currency, setCurrency] = useState<string | undefined>('£');

  const letterVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.08, duration: 0.3 },
    }),
  };
  
  const fetchAllUserDebts = async () => {
    const { data, error } = await supabase
    .from("debts")
    .select("*") // Joining the profiles table where profile.id = debts.lender_id
    .or(`lender_id.eq.${session?.user?.id}, borrower_id.eq.${session?.user?.id}`); // Checking for 2 conditions
  
    if (data && !error) {      
      setAllDebts(data)
    } else {
      console.error('Unable to fetch user debts', error)
    }
  }

  const fetchFriendList = async () => {
    const { data, error } = await supabase
    .from("friends")
    .select("id, friend_id, first_name, last_name, avatar_url")
    .eq("user_id", session?.user?.id) // Id will not equal the current session user so it will only return the other user profiles

    if (data && !error) {
      setAllUsers(data)
    } else {
      console.error("Unable to retrieve all user profiles", error)
    }
  }

  const fetchCurrentUserProfile = async () => {
    const { data, error } = await supabase
    .from("profiles")
    .select("avatar_url")
    .eq("id", session?.user?.id)
    .single();
    
    if (data && !error) {
      setUserAvatar(data.avatar_url)      
    }
  }
  
  useEffect(() => {
    fetchAllUserDebts();
    fetchFriendList();
    fetchCurrentUserProfile();
  }, [session]);
  
  return (
    <div>
      <div className="sticky top-0 z-10 p-6 flex flex-wrap items-center justify-between bg-[#f9f9f9]">
        <div className='flex flex-col sm:flex-row sm:items-center sm:space-x-4 min-w-0 flex-shrink'>
          <img src={userAvatar || DefaultAvatar} 
          alt='profile image' 
          className='w-34 h-34 sm:w-28 sm:h-28 rounded-full border-3 border-orange-500 object-cover flex-shrink-0' /> 
          <h1 className='hidden sm:block text-2xl md:text-4xl lg:text-5xl mt-2 sm:mt-0 break-words min-w-0 font-bold text-gray-800'>
          {greeting.split('').map((char, i) => (
            <motion.span
              key={i}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={letterVariants}
            >
            {char === " " ? '\u00A0' : char}
            </motion.span>
          ))}
          </h1>
        </div>

        <div className='text-sm sm:text-lg flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 flex-shrink-0 mt-4 sm:mt-0'>
          <DebtNotification session={session} onDebtAdded={fetchAllUserDebts} />
          <SettingsTab 
          profileIcon={userAvatar} 
          onAvatarUpdated={fetchCurrentUserProfile} 
          currency={currency} 
          onCurrencyChange={setCurrency} 
          session={session}
          friendsList={allUsers}
          refreshFriendsList={fetchFriendList} />
          <button onClick={signOut}>Sign out</button>
        </div>
      </div>

      <div className='flex flex-col md:flex-row gap-6'>
        <DebtChart debts={allDebts} currency={currency} />
        <DebtForm session={session} onDebtAdded={fetchAllUserDebts} allUsers={allUsers} currency={currency} />
      </div>

      <div>
        <DebtTable allDebts={allDebts} onDebtAdded={fetchAllUserDebts} sessionUser={session?.user?.user_metadata?.full_name} sessionUserId={session?.user?.id} currency={currency} />
      </div>
    </div>
  )
}

export default Dashboard
