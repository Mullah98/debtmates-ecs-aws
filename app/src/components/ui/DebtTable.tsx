import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/shadcn-ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/shadcn-ui/tabs";
import { motion } from "framer-motion";
import { Select, SelectTrigger, SelectContent, SelectGroup, SelectLabel, SelectItem, SelectValue } from "@/components/shadcn-ui/select";
import type { Debt } from "./DebtForm";
import { supabase } from "../../../supabaseClient";
import { FaTrash } from 'react-icons/fa';
import { toast } from "sonner";

interface DebtTableProps {
  allDebts: Debt[]
  onDebtAdded: () => void
  sessionUser: string | undefined
  sessionUserId: string | undefined
  currency: string | undefined
}

function DebtTable({ allDebts, onDebtAdded, sessionUser, sessionUserId, currency }: DebtTableProps) {

  const formatter = new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    hour12: true
  })

  //Function to update debt status
  const updateDebt = async (debt: Debt, newStatus: string) => {
    const { error } = await supabase
    .from("debts")
    .update({ status: newStatus})
    .eq("id", debt.id)

    if (error) {
      console.error("Unable to update the debt status", error);
      toast.error("Unable to update debt");
    } else {
      onDebtAdded();
    }
  }

  // Function to handle the confirmation of the debt status. Lender will recieve a notification to confirm whether debts is paid or denied.
  const handleStatusChange = async (debt: Debt, value: string) => {
    if (sessionUserId === debt.borrower_id && value === "paid") {
      await updateDebt(debt, "pending");

      if (debt.lender_id) {
        const { error } = await supabase.from("notifications").insert([{
          user_id: debt.lender_id,
          title: "Confirm debt status",
          body: `${debt.borrower_name} marked this debt as paid. Please confirm:`,
          read: false,
          type: "debt_status_update",
          related_debt_id: debt.id
        }]);

        if (error) {
          console.log('error updating debt status', error);
          toast.error("Unable to update debt. Please try again.")
        }
      }
    } else {
      await updateDebt(debt, value)
    }
  }

  //Function to delete user debts
  const deleteDebt = async (debt: Debt) => {    
    const {error} = await supabase
    .from("debts")
    .delete()
    .eq("id", debt.id)

    if (error) {
      console.error('Could not delete debt', error)
      toast.error("Unable to delete debt. Please try again.")
    } else {      
      onDebtAdded();      
    }
  }  
  
  return (
  <Tabs defaultValue="owedToYou" className="w-full mt-6 text-sm sm:text-base">
    <TabsList className="flex space-x-2 mb-2">
      <TabsTrigger value="owedToYou">Debts owed to you</TabsTrigger>
      <TabsTrigger value="youOwe">Debts you owe</TabsTrigger>
    </TabsList>

    <TabsContent value="owedToYou">
      <motion.div 
      key="owedToYou"  
      initial={{opacity: 0, x: -20}} 
      animate={{opacity: 1, x: 0}} 
      exit={{opacity: 0, x: -20}} 
      transition={{duration: 0.6, ease: "easeInOut"}}
      >
      <div className="p-4 rounded-lg shadow">
        <Table>
          <TableCaption>
            {allDebts.filter(debt => debt.lender_name === sessionUser).length !== 0
              ? 'A list of debts owed to you.'
              : 'No one owes you anything.'}
          </TableCaption>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[100px] text-xs sm:text-sm">Name</TableHead>
              <TableHead className="text-right text-xs sm:text-sm">Amount</TableHead>
              <TableHead className="text-right text-xs sm:text-sm">Due Date</TableHead>
              <TableHead className="text-center text-xs sm:text-sm">Status</TableHead>
              <TableHead className="text-center text-xs sm:text-sm">Description</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allDebts
              .filter(debt => debt.lender_name === sessionUser)
              .map((debt) => (
                <TableRow key={debt.id}>
                  <TableCell className="px-2 text-left font-semibold text-xs sm:text-sm">{debt.borrower_name}</TableCell>
                  <TableCell className="px-2 text-right font-semibold text-xs sm:text-sm">{currency}{debt.amount}</TableCell>
                  <TableCell className="px-2 text-right text-gray-800 text-xs sm:text-sm">{formatter.format(new Date(debt.due_date))}</TableCell>
                  <TableCell className="px-2 text-right">
                    <div className="flex justify-center text-xs sm:text-sm">
                      <Select value={debt.status} onValueChange={(value) => handleStatusChange(debt, value)}>
                        <SelectTrigger className="w-auto">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Status</SelectLabel>
                            <SelectItem value="paid">
                              <div className="flex items-center gap-2 text-green-500 text-xs sm:text-sm">
                                <span className="w-3 h-3 rounded-full shadow-md bg-green-500"></span>
                                Paid
                              </div>
                            </SelectItem>
                            <SelectItem value="unpaid">
                              <div className="flex items-center gap-2 text-red-500 text-xs sm:text-sm">
                                <span className="w-3 h-3 rounded-full shadow-md bg-red-500"></span>
                                Unpaid
                              </div>
                            </SelectItem>
                            <SelectItem value="pending">
                              <div className="flex items-center gap-2 text-orange-500 text-xs sm:text-sm">
                                <span className="w-3 h-3 rounded-full shadow-md bg-orange-500"></span>
                                Pending
                              </div>
                            </SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                  </TableCell>
                  <TableCell className="px-2 text-center text-gray-800 text-xs sm:text-sm">{debt.description}</TableCell>
                  <TableCell><button onClick={() => deleteDebt(debt)}><FaTrash color="red" /></button></TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
      </motion.div>
    </TabsContent>

    <TabsContent value="youOwe">
    <motion.div 
    key="youOwe" 
    initial={{opacity: 0, x: -20}} 
    animate={{opacity: 1, x: 0}} 
    exit={{opacity: 0, x: -20}} 
    transition={{duration: 0.3, ease: "easeInOut"}}
    > 
    <div className="p-4 rounded-lg shadow">
      <Table>
        <TableCaption>
          {allDebts.filter(debt => debt.borrower_name === sessionUser).length !== 0
            ? 'A list of debts you owe.'
            : 'You are debt free.'}
        </TableCaption>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[100px] text-xs sm:text-sm">Name</TableHead>
            <TableHead className="text-right text-xs sm:text-sm">Amount</TableHead>
            <TableHead className="text-right text-xs sm:text-sm">Due Date</TableHead>
            <TableHead className="text-center text-xs sm:text-sm">Status</TableHead>
            <TableHead className="text-center text-xs sm:text-sm">Description</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {allDebts
            .filter(debt => debt.borrower_name === sessionUser)
            .map((debt) => (
              <TableRow key={debt.id}>
                <TableCell className="px-2 text-left font-semibold text-xs sm:text-sm">{debt.lender_name}</TableCell>
                <TableCell className="px-2 text-right font-semibold text-sm text-xs sm:text-sm">£{debt.amount}</TableCell>
                <TableCell className="px-2 text-right text-gray-800 text-xs sm:text-sm">{formatter.format(new Date(debt.due_date))}</TableCell>
                <TableCell className="px-2 text-right">
                  <div className="flex justify-center">
                    <Select value={debt.status} onValueChange={(value) => handleStatusChange(debt, value)}>
                      <SelectTrigger className="w-auto">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Status</SelectLabel>
                          <SelectItem value="paid">
                            <div className="flex items-center gap-2 text-green-500 text-xs sm:text-sm">
                              <span className="w-3 h-3 rounded-full shadow-md bg-green-500"></span>
                              Paid
                            </div>
                          </SelectItem>
                          <SelectItem value="unpaid">
                            <div className="flex items-center gap-2 text-red-500 text-xs sm:text-sm">
                              <span className="w-3 h-3 rounded-full shadow-md bg-red-500"></span>
                              Unpaid
                            </div>
                          </SelectItem>
                          <SelectItem value="pending">
                            <div className="flex items-center gap-2 text-orange-500 text-xs sm:text-sm">
                              <span className="w-3 h-3 rounded-full shadow-md bg-orange-500"></span>
                              Pending
                            </div>
                          </SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </TableCell>
                <TableCell className="px-2 text-center text-gray-800 text-xs sm:text-sm">{debt.description}</TableCell>
                <TableCell><button onClick={() => deleteDebt(debt)}><FaTrash color="red" /></button></TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
    </motion.div>
  </TabsContent>
  </Tabs>
  )
}

export default DebtTable