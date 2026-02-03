import { supabase } from "../../../supabaseClient"
import type { Session } from '@supabase/supabase-js';
import { useEffect, useState } from "react";
import { Button } from "../shadcn-ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../shadcn-ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../shadcn-ui/tabs";
import { motion } from "framer-motion";
import { CircleCheckBig, Trash2, Bell } from 'lucide-react';
import { toast } from "sonner";

interface DebtNotificationProps {
    session: Session | null
    onDebtAdded: () => void
}

interface Notification {
    id: string
    user_id: string
    created_at: string
    title: string
    body: string
    read?: boolean
    type: string
    related_debt_id?: string
}

function DebtNotification({session, onDebtAdded}: DebtNotificationProps) {
    const [notification, setNotification] = useState<Notification[]>([]);
    const [open, setOpen] = useState(false);
    const [tab, setTab] = useState("unread");

const fetchUserNotifications = async () => {
    const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", session?.user?.id)

    if (!notifications) {
      console.error("No notifications found.");
      setNotification([])
      setOpen(false)
      return;
    }
        
    setNotification(notifications);
        
    if (notifications.length > 0 && notifications.some(n => !n.read)) {
      setOpen(true)
    } else {
      setOpen(false)
    }
};

const markAsRead = async (notification: Notification) => {
  const { error } = await supabase
  .from("notifications")
  .update({read: true})
  .eq("id", notification.id)

  if (error) {
    console.error("Unable to update notification", error);
  } else {
    fetchUserNotifications();
  }
}

// Function to confirm the status of the debt payment
const handleDebtDecision = async (notification: Notification, decision: 'paid' | 'unpaid') => {
  await supabase
  .from("notifications")
  .update({read: true})
  .eq("id", notification.id)
  
  const { error } = await supabase
  .from("debts")
  .update({status: decision})
  .eq("id", notification.related_debt_id)

  if (error) {
    console.error("Unable to update debt status", error);
    toast.error(`Unable to update debt as ${decision}`)
  } else {
    fetchUserNotifications();
    onDebtAdded();
    toast.success(`Debt marked as ${decision}`)
  }
}

const deleteNotification = async (notification: Notification) => {
  const { error } = await supabase
  .from("notifications")
  .delete()
  .eq("id", notification.id)

  if (error) {
    console.error("Unable to delete notifications");
  } else {
    fetchUserNotifications();
  }
}

useEffect(() => {
    fetchUserNotifications();
}, [])

  return (
  <Dialog open={open} onOpenChange={setOpen}>
    <DialogTrigger asChild>
      <Button variant="outline" className=""><Bell size={40} className="" />{notification.filter(n => !n.read).length}</Button>
    </DialogTrigger>
    <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto rounded-xl shadow-xl bg-white">
      <DialogHeader>
        <DialogTitle className="text-xl">Notifications</DialogTitle>
        <DialogDescription className="text-sm text-muted-foreground">
          Your latest updates
        </DialogDescription>
      </DialogHeader>

      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="flex space-x-2">
          <TabsTrigger value="unread">Unread</TabsTrigger>
          <TabsTrigger value="read">Read</TabsTrigger>
        </TabsList>

      {tab === "unread" && (
      <motion.div
        key="unread"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -100 }}
        transition={{ type: "spring", stiffness: 500 }}
        className="space-y-4 mt-4"
      >
      <TabsContent value="unread">
      <div className="space-y-4 mt-4">
        {notification.filter(notif => !notif.read).map((notif) => (
          <div key={notif.id} className="border p-4 rounded-lg shadow-sm bg-gray-50 flex flex-col justify-between">
            <div className="text-base sm:text-lg font-semibold text-gray-800">{notif.title}</div>
            <div className="text-md text-gray-600 mt-1">{notif.body}</div>
            {notif.type === "debt_status_update" && (
            <div className="flex gap-3 mt-3 my-2">
              <Button onClick={() => handleDebtDecision(notif, 'paid')}>Confirm</Button>
              <Button variant="destructive" onClick={() => handleDebtDecision(notif, 'unpaid')}>Deny</Button>
            </div>
            )}
            <div className="text-sm text-muted-foreground mt-2">
              {new Date(notif.created_at).toLocaleString()}
            </div>
            <div className="flex justify-end">
              <Button onClick={() => markAsRead(notif)}>
                <CircleCheckBig size={40} />
              </Button>
            </div>
          </div>
        ))}
        {notification.filter(notif => !notif.read).length === 0 && (
          <div className="text-center text-sm text-muted-foreground">
            No unread notifications
          </div>
        )}
      </div>
      </TabsContent>
      </motion.div>
      )}
      
      {tab === "read" && (
      <motion.div
        key="read"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -100 }}
        transition={{ type: "spring", stiffness: 500 }}
        className="space-y-4 mt-4"
      >
      <TabsContent value="read">
      <div className="space-y-4 mt-4">
        {notification.filter(notif => notif.read).map((notif) => (
          <div key={notif.id} className="border p-4 rounded-lg shadow-sm bg-gray-50 flex flex-col justify-between">
            <div className="text-lg font-semibold text-gray-800">{notif.title}</div>
            <div className="text-md text-gray-600 mt-1">{notif.body}</div>
            <div className="text-sm text-muted-foreground mt-2">
              {new Date(notif.created_at).toLocaleString()}
            </div>
            <div className="flex justify-end">
              <Button onClick={() => deleteNotification(notif)}>
                <Trash2 size={40} />
              </Button>
            </div>
          </div>
        ))}
      </div>
      </TabsContent>
      </motion.div>
      )}
      </Tabs>

      <DialogFooter className="mt-4">
        <DialogClose asChild>
          <Button variant="outline">Close</Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  </Dialog>
  )
}

export default DebtNotification
