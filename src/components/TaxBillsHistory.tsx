import { motion } from "framer-motion";
import {
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
  CreditCard,
  Loader2,
  Receipt,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTaxBills, useMarkTaxPaid } from "@/hooks/useTaxBills";
import { formatPKR } from "@/lib/currency";
import { format, isPast } from "date-fns";
import { toast } from "sonner";

export default function TaxBillsHistory() {
  const { data: taxBills = [], isLoading } = useTaxBills();
  const markPaid = useMarkTaxPaid();

  const handleMarkPaid = async (billId: string) => {
    try {
      await markPaid.mutateAsync(billId);
      toast.success("Tax bill marked as paid");
    } catch (error) {
      toast.error("Failed to mark tax bill as paid");
    }
  };

  const getStatusInfo = (bill: any) => {
    if (bill.status === "paid") {
      return {
        label: "Paid",
        color: "text-emerald-500 bg-emerald-500/10",
        icon: <CheckCircle className="w-4 h-4" />,
      };
    }
    if (isPast(new Date(bill.due_date))) {
      return {
        label: "Overdue",
        color: "text-destructive bg-destructive/10",
        icon: <AlertTriangle className="w-4 h-4" />,
      };
    }
    return {
      label: "Pending",
      color: "text-amber-500 bg-amber-500/10",
      icon: <Clock className="w-4 h-4" />,
    };
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (taxBills.length === 0) {
    return (
      <div className="text-center py-12">
        <Receipt className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-bold text-foreground mb-2">No Tax Bills</h3>
        <p className="text-muted-foreground">
          Tax bills are generated automatically when you make withdrawals
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {taxBills.map((bill) => {
        const status = getStatusInfo(bill);
        const isOverdue =
          bill.status === "pending" && isPast(new Date(bill.due_date));

        return (
          <motion.div
            key={bill.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className={isOverdue ? "border-destructive/50" : ""}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        Tax Bill -{" "}
                        {format(new Date(bill.period_start), "MMM yyyy")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(bill.period_start), "PP")} -{" "}
                        {format(new Date(bill.period_end), "PP")}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span
                          className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${status.color}`}
                        >
                          {status.icon}
                          {status.label}
                        </span>
                        {bill.status === "pending" && (
                          <span className="text-xs text-muted-foreground">
                            Due: {format(new Date(bill.due_date), "PP")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Tax Amount</p>
                    <p className="text-lg font-bold text-destructive">
                      {formatPKR(bill.tax_amount)}
                    </p>
                  </div>
                </div>

                {/* Bill Details */}
                <div className="mt-4 pt-4 border-t border-border grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Withdrawn</p>
                    <p className="font-medium">
                      {formatPKR(bill.withdrawn_amount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Tax Rate</p>
                    <p className="font-medium">
                      {(bill.tax_rate * 100).toFixed(0)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Net Payout</p>
                    <p className="font-medium text-primary">
                      {formatPKR(bill.net_payout)}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                {bill.status === "pending" && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <Button
                      onClick={() => handleMarkPaid(bill.id)}
                      className="w-full"
                      disabled={markPaid.isPending}
                    >
                      {markPaid.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <CreditCard className="w-4 h-4 mr-2" />
                      )}
                      Mark as Paid
                    </Button>
                    <p className="text-xs text-muted-foreground text-center mt-2">
                      Payment should be made to the platform's designated
                      account
                    </p>
                  </div>
                )}

                {bill.status === "paid" && bill.paid_at && (
                  <div className="mt-4 pt-4 border-t border-border text-center">
                    <p className="text-sm text-emerald-500">
                      ✓ Paid on {format(new Date(bill.paid_at), "PPP")}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
