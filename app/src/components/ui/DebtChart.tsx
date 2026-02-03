"use client"
import { TrendingUp } from "lucide-react";
import { Pie, PieChart } from "recharts";
import type { ChartConfig } from "@/components/shadcn-ui/chart";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/shadcn-ui/chart";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/shadcn-ui/card";
import type { Debt } from "./DebtForm";

interface DebtChartProps {
  debts: Debt[]
  currency: string | undefined
}

function DebtChart({ debts, currency }: DebtChartProps) {

  // Function to calculate the total debts for each debt status ('Paid', 'Unpaid', and 'Pending)
  const calculateDebtTotals = (debts: Debt[]) => {
    let paidTotal = 0
    let unpaidTotal = 0
    let pendingTotal = 0

    debts.forEach((debt) => {
      if (debt.status === "paid") paidTotal += Number(debt.amount)
      else if (debt.status === "unpaid") unpaidTotal += Number(debt.amount)
      else if (debt.status === "pending") pendingTotal += Number(debt.amount)
    })

    return { paidTotal, unpaidTotal, pendingTotal }
  }

  const { paidTotal, unpaidTotal, pendingTotal } = calculateDebtTotals(debts)

  const chartData = [
    { status: "paid", amount: paidTotal, fill: "#4ade80" },
    { status: "owed", amount: unpaidTotal, fill: "#f87171" },
    { status: "pending", amount: pendingTotal, fill: "#facc15" },
  ]

  const chartConfig = {
    amount: {
      label: "Amount",
    },
    paid: {
      label: "Paid",
      color: "var(--chart-1)",
    },
    unpaid: {
      label: "Unpaid",
      color: "var(--chart-2)",
    },
    pending: {
      label: "Pending",
      color: "var(--chart-3)",
    },
  } satisfies ChartConfig

  return (
  <Card className="flex-1 flex-col p-1 rounded-lg shadow">
    <CardHeader className="items-center mt-2 pb-2 ">
      <CardTitle>Debt Breakdown</CardTitle>
      <CardDescription>2025</CardDescription>
    </CardHeader>

    <CardContent className="p-0 ">
      <ChartContainer
        config={chartConfig}
        className="mx-auto aspect-square w-full max-w-[250px] sm:max-w-[350px]"
      >
        <PieChart className="w-full h-full">
          <ChartTooltip
            content={<ChartTooltipContent nameKey="status" hideLabel />}
          />
          <Pie
            data={chartData}
            dataKey="amount"
            nameKey="status"
            labelLine={false}
          />
        </PieChart>
      </ChartContainer>
    </CardContent>

    <CardFooter className="flex-col gap-1 text-sm">
      <div className="flex items-center gap-2 leading-none font-medium">
        You have {currency}{unpaidTotal} left to pay <TrendingUp className="h-4 w-4" />
      </div>
      <div className="text-muted-foreground leading-none">
        Based on financial data from the last 6 months
      </div>
    </CardFooter>
  </Card>
  )
}

export default DebtChart