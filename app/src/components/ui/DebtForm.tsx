"use client"

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/shadcn-ui/form";
import { Input } from "@/components/shadcn-ui/input";
import { Button } from "@/components/shadcn-ui/button";
import { Textarea } from "@/components/shadcn-ui/textarea";
import { supabase } from "../../../supabaseClient";
import type { Session } from "@supabase/supabase-js";
import type { User } from "../Dashboard";
import { useState } from "react";
import { toast } from "sonner";
import DefaultAvatar from '../../assets/default_avatar.png';

// Schema to validate the debt form input
const formSchema = z.object({
  id: z.string().uuid().optional(),
  borrower_name: z.string().min(1, "Name is required"),
  borrower_id: z.string().uuid().optional(),
  amount: z.string().min(1, "Amount is required"),
  description: z.string().min(1, "Description is required"),
  due_date: z.string().min(1, "Due date is required"),
  status: z.enum(["pending", "paid", "unpaid"]),
  lender_name: z.string().optional(),
  lender_id: z.string().uuid().optional(),
})

export type Debt = z.infer<typeof formSchema>

interface DebtFormProps {
  session: Session | null
  onDebtAdded: () => void
  allUsers: User[]
  currency: string | undefined
}

function DebtForm({ session, onDebtAdded, allUsers, currency }: DebtFormProps) {
  const [searchTerm, setSearchTerm] = useState("");
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
      defaultValues: {
      borrower_name: "",
      amount: "",
      description: "",
      due_date: "",
      status: "unpaid",
    },
  })

  const addNewDebt = async (newDebt: Debt) => {
    if (!session?.user) return;

    const { error } = await supabase.from("debts").insert([{ 
      ...newDebt,
      lender_id: session?.user?.id, 
      lender_name: session?.user?.user_metadata.full_name,
    }]);    
    
    if (error) {
      console.error("Error adding new debt", error);
      toast.error("Something went wrong while adding the debt. Please try again.")
      return;
    }
    
    toast.success(`You have assigned a new debt to ${newDebt.borrower_name}`);
    onDebtAdded();
    form.reset();
    setSearchTerm("");

    if (newDebt.borrower_id) {
      await supabase.from("notifications").insert([{
      user_id: newDebt?.borrower_id,
      title: "New debt assigned",
      body: `${session.user.user_metadata.full_name} assigned you a new debt.`,
      read: false,
      type: "new_debt"
      }]);
    }
  }

  // Filter users by first name, case-sensitive match with search term
  const filteredUsers = allUsers.filter(user => 
    user.first_name.toLowerCase().includes(searchTerm.toLowerCase())
  )  

  return (
  <Form {...form}>
    <form onSubmit={form.handleSubmit(addNewDebt)} className="flex-1 p-4 rounded-lg shadow space-y-4">
    <FormField
        control={form.control}
        name="borrower_name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Name</FormLabel>
            <FormControl>
            <div>
              <Input 
              className="w-full border p-2 rounded-md"
              placeholder="Who is this for?" {...field}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                form.setValue("borrower_name", e.target.value)
                }}
              autoComplete="off"
              />
              {searchTerm && searchTerm.length > 2 && (
              <ul>
                {filteredUsers.map(user => (
                  <li 
                  key={user.id}
                  onClick={() => {
                    form.setValue("borrower_id", user.friend_id?.toString())
                    form.setValue("borrower_name", `${user.first_name} ${user.last_name}`)
                    setSearchTerm(`${user.first_name} ${user.last_name}`)
                  }}
                  className="mt-1 p-2 flex items-center justify-center cursor-pointer bg-gray-100 hover:bg-gray-200 hover:text-orange-400 rounded-lg" >
                    <div className="flex align-center items-center gap-3">
                    <img src={user.avatar_url || DefaultAvatar} alt={`${user.first_name} avatar`} className="w-8 h-8 rounded-full object-cover"></img>
                    {`${user.first_name} ${user.last_name}`}
                    </div>
                  </li>
                ))}
              </ul>
            )}
            </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="amount"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Amount ({currency})</FormLabel>
            <FormControl>
              <Input type="number" placeholder="Enter amount" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea placeholder="What is this debt for?" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="due_date"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Due Date</FormLabel>
            <FormControl>
              <Input type="date" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="status"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Status</FormLabel>
            <FormControl>
              <select {...field} className="w-full border p-2 rounded-md">
                <option value="unpaid">Unpaid</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
              </select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <Button type="submit">Add Debt</Button>
    </form>
  </Form>
  )
}

export default DebtForm