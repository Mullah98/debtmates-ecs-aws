import { useEffect, useState, type ChangeEvent } from 'react';
import {
    Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger
} from '../shadcn-ui/sheet';
import { Settings } from 'lucide-react';
import { v4 as uuidv4 } from "uuid";
import { supabase } from '../../../supabaseClient';
import { toast } from 'sonner';
import DefaultAvatar from '../../assets/default_avatar.png'
import { Tabs, TabsTrigger, TabsList } from '@/components/shadcn-ui/tabs';
import { Input } from '@/components/shadcn-ui/input';
import { Command, CommandItem, CommandList } from '@/components/shadcn-ui/command';
import { Button } from '@/components/shadcn-ui/button';
import type { Session } from '@supabase/supabase-js';
import type { User } from '@/components/Dashboard';
import { FaMinusCircle } from "react-icons/fa";
import { IoIosArrowDropupCircle, IoIosArrowDropdownCircle } from "react-icons/io";

type UploadStatus = "idle" | "uploading" | "success" | "error";

interface SettingsTabProps {
    profileIcon: string | undefined
    onAvatarUpdated?: () => void
    currency: string | undefined
    onCurrencyChange: (value: string) => void
    session: Session | null
    friendsList: User[]
    refreshFriendsList: () => void
}

function SettingsTab( { profileIcon, onAvatarUpdated, onCurrencyChange, session, friendsList, refreshFriendsList }: SettingsTabProps) {
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<UploadStatus>('idle');
    const [userProfileIcon, setUserProfileIcon] = useState<string | undefined>(profileIcon);
    const [currency] = useState('GBP');
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [results, setResults] = useState<User[] | null>([]);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    useEffect(() => {
        setUserProfileIcon(profileIcon),
        fetchAllUsers()
    }, [profileIcon]);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0])
        }
    }

    // Uploading the selected file to Supabase storage and update the user's profile
    const handleFileUpload = async () => {
        if (!file) return;

        setStatus("uploading");

        // Generate a unique file name to avoid conflicts
        const fileName = `${uuidv4()}-${file.name}`;

        const { error } = await supabase.storage
        .from("avatars")
        .upload(`${session?.user?.id}/${fileName}`, file);

        if (error) {
            console.error('Error uploading file' ,error);
            setStatus("error");
            toast.error("Upload failed. Please try again.");
            return;
        }

        const { data: publicUrl } = supabase.storage
        .from("avatars")
        .getPublicUrl(`${session?.user.id}/${fileName}`);        
        
        const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl.publicUrl })
        .eq("id", session?.user.id);

        if (updateError) {
            console.error(updateError);
            setStatus("error");
            toast.error("Failed to save avatar.");
            return;
        }
        
        setUserProfileIcon(publicUrl.publicUrl);
        setStatus("success");        
        toast.success("Avatar successfully updated!");
        setFile(null); // Clear the file and status once the new profile avatar is updated
        setTimeout(() => setStatus('idle'), 3000);
        onAvatarUpdated?.(); // Notify Dashboard component the avatar was updated
    }

    const fetchAllUsers = async () => {
        const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .neq("id", session?.user?.id) // Id will not equal the current session user so it will only return the other user profiles

        if (data && !error) {
        setResults(data)
        } else {
        console.error("Unable to retrieve all user profiles", error)
        }
    }

    const filteredUsers = results?.filter(user => 
        user?.first_name?.toLowerCase().includes(searchTerm?.toLowerCase())
    )

    const addFriend = async (friend: User) => {
        const { error } = await supabase
        .from("friends")
        .insert([{
            user_id: session?.user?.id, 
            friend_id: friend?.id, 
            first_name: friend.first_name, 
            last_name: friend.last_name, 
            avatar_url: friend.avatar_url,
        }]);
        
        if (error) {
            console.error('Error adding friend to list', error);
            toast.error("Unable to add new friend. Please try again.")
        } else {
            refreshFriendsList();
            setSearchTerm("")
            toast.success("You've added a new friend!")
        }
    }

    const deleteFriend = async (friend: User) => {
        const { error } = await supabase
        .from("friends")
        .delete()
        .eq("user_id", session?.user?.id)
        .eq("friend_id", friend.friend_id)

        if (error) {
            console.error("Error deleting friend", error)
            toast.error("Unable to delete friend. Please try again.")
        } else {
            toast.success("Friend successfully removed!");
            refreshFriendsList();
        }
    }
    
  return (
  <Sheet>
    <SheetTrigger>
        <Settings size={20}/>
    </SheetTrigger>
    
    <SheetContent className='pt-6 flex flex-col items-center overflow-y-auto'>
        <div className='flex flex-col items-center gap-6'>
            <SheetHeader className='mt-2 text-center w-full flex flex-col items-center'>
            <SheetTitle className='mt-2'>Profile settings</SheetTitle>
            <SheetDescription>Upload your profile image.</SheetDescription>
                {status === "uploading" ? (
                    <div className="w-28 h-28 sm:w-36 sm:h-36 flex items-center justify-center rounded-full border border-gray-300">
                        <span className="animate-spin h-6 w-6 border-4 border-blue-500 border-t-transparent rounded-full"></span>
                    </div>
                ) : (
                    <img
                        src={userProfileIcon || DefaultAvatar}
                        alt="profile image"
                        className="w-28 h-28 sm:w-36 sm:h-36 rounded-full border border-gray-300 object-cover mt-4"
                    />
                )}

            <div className="flex flex-col items-center w-full mt-4">
                <label
                    htmlFor="avatar-upload"
                    className="text-sm cursor-pointer px-4 py-2 bg-orange-400 text-white rounded-md shadow hover:bg-orange-500"
                >
                    Choose File
                </label>
                <input
                    id="avatar-upload"
                    type="file"
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                />
                {file && ( 
                    <div className='flex flex-col items-center mt-2'>
                        <p className="text-sm text-gray-600 max-w-[300px] truncate mt-2">
                            Selected: {file.name}
                        </p>
                        <button onClick={handleFileUpload} disabled={status === 'uploading'}>
                            {status === 'uploading' ? "Uploading.." : "Upload image"}
                        </button>
                    </div>
                )}

            </div>
            </SheetHeader>
        </div>
            
        <div className='flex flex-col items-center gap-4 border-t border-gray-200'>
            <SheetHeader className='mt-4 text-center'>
                <SheetTitle>Friends list settings</SheetTitle>
                <SheetDescription>Add or remove friends</SheetDescription>
            </SheetHeader>

            <Input className="w-auto sm:w-82" placeholder='Search for friends...' value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            <Command className='rounded-md w-64 sm:w-82 max-w-md h-auto text-sm sm:text-base'>
                {searchTerm && searchTerm.length > 2 && (
                <CommandList className='max-h-60 overflow-y-auto'>
                    {filteredUsers?.map((user) => (
                        <CommandItem key={user.id} className='flex justify-between items-center w-full px-2 sm:px-4 py-1 sm:py-2 gap-2 sm:gap-4 text-sm'>
                            <div className='flex items-center gap-2'>
                                <img src={user.avatar_url || DefaultAvatar} alt={user.first_name} className='w-12 h-12 rounded-full object-cover'/>
                                <span>{user.first_name} {user.last_name}</span>
                            </div>
                            <Button size='sm' onClick={() => addFriend(user)} disabled={friendsList.some(friend => friend.friend_id === user.id)}>
                                Add friend
                            </Button>
                        </CommandItem>
                    ))}
                </CommandList>
                )}
            </Command>

        <div className='mt-2 w-full max-w-md'>
            <div className='flex items-center justify-center cursor-pointer gap-2' onClick={() => setDropdownOpen(!dropdownOpen)}>
                <span className='text-base font-semibold my-1 flex gap-2'>
                    Your friends list 
                    <span className='inline-flex items-center justify-center px-2 text-sm font-medium text-white bg-orange-400 rounded-full'>
                        {friendsList.length}
                    </span>
                </span>
                {dropdownOpen ? (
                    <IoIosArrowDropupCircle color='orange' />
                ) : (
                    <IoIosArrowDropdownCircle color='orange' />
                )}
            </div>
            
            <div className={`overflow-hidden transition-[max-height] duration-300 ease-in-out`} style={{ maxHeight: dropdownOpen ? '15rem' : '0' }}>
            <Command className='text-center rounded-md border-none w-full h-auto'>
                <CommandList className='w-full'>
                    {friendsList.length > 0 ? (
                        friendsList.map((friend) => (
                            <CommandItem key={friend.friend_id} className='flex justify-between items-center px-4 py-2 gap-4'>
                                <div className='flex items-center gap-2'>
                                    <img src={friend.avatar_url || DefaultAvatar} alt={friend.first_name} className='w-12 h-12 rounded-full object-cover' />
                                    <span>{friend.first_name} {friend.last_name}</span>
                                </div>
                                    <Button size='sm' onClick={() => deleteFriend(friend)} title='Remove friend from list'><FaMinusCircle color='red' /></Button>
                            </CommandItem>
                        ))
                    ) : (
                        <p className='text-sm text-gray-500 px-4 py-3'>No friends added yet.</p>
                    )}
                </CommandList>
            </Command>
            </div>
        </div>
        </div>

        <div className='flex flex-col items-center gap-4 border-t border-gray-200 pt-4'>
            <SheetHeader className='mt-6 text-center'>
                <SheetTitle>Preference</SheetTitle>
                <SheetDescription>Update your preference settings</SheetDescription>
            </SheetHeader>
            <Tabs value={currency} onValueChange={onCurrencyChange}>
                <TabsList className='flex space-x-2 mb-2'>
                    <TabsTrigger value='$' className='px-4 py-2 rounded border border-gray-200 data-[state=active]:border-orange-500'>$</TabsTrigger>
                    <TabsTrigger value='£' className='px-4 py-2 rounded border border-gray-200 data-[state=active]:border-orange-500'>£</TabsTrigger>
                    <TabsTrigger value='€' className='px-4 py-2 rounded border border-gray-200 data-[state=active]:border-orange-500'>€</TabsTrigger>
                </TabsList>
            </Tabs>
        </div>
    </SheetContent>
    </Sheet>
  )
}

export default SettingsTab
