import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Calendar, User, Wallet, Calculator } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { formatPKR } from '@/lib/currency';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import type { Earning } from '@/hooks/useEarnings';
import { useAuth } from '@/hooks/useAuth';

interface TaxBillModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  earnings: Earning[];
  userType: string;
}

const TAX_RATES = {
  restaurant: 0.10, // 10% tax for restaurants
  homechef: 0.10,   // 10% tax for homechefs
  driver: 0.05,     // 5% tax for drivers
};

export default function TaxBillModal({
  open,
  onOpenChange,
  earnings,
  userType,
}: TaxBillModalProps) {
  const { user } = useAuth();
  const billRef = useRef<HTMLDivElement>(null);
  
  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
  const [showBill, setShowBill] = useState(false);

  // Filter earnings by date range
  const filteredEarnings = earnings.filter(e => {
    const earningDate = new Date(e.created_at);
    return earningDate >= new Date(startDate) && earningDate <= new Date(endDate + 'T23:59:59');
  });

  const totalGross = filteredEarnings.reduce((sum, e) => sum + e.gross_amount, 0);
  const totalCommission = filteredEarnings.reduce((sum, e) => sum + e.commission_amount, 0);
  const totalNet = filteredEarnings.reduce((sum, e) => sum + e.net_amount, 0);
  
  const taxRate = TAX_RATES[userType as keyof typeof TAX_RATES] || 0.10;
  const taxAmount = totalNet * taxRate;
  const netAfterTax = totalNet - taxAmount;

  const handleGenerateBill = () => {
    setShowBill(true);
  };

  const handlePrint = () => {
    const printContent = billRef.current?.innerHTML;
    if (!printContent) return;
    
    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) return;
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Tax Bill - ${format(new Date(startDate), 'MMM yyyy')}</title>
          <style>
            body { font-family: system-ui, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
            h1 { color: #333; text-align: center; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
            .section { margin: 20px 0; }
            .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
            .label { color: #666; }
            .value { font-weight: 600; }
            .total { font-size: 1.2em; border-top: 2px solid #333; padding-top: 10px; margin-top: 20px; }
            .summary { background: #f9f9f9; padding: 20px; border-radius: 8px; margin-top: 30px; }
            .tax { color: #dc2626; }
            .net { color: #16a34a; font-size: 1.4em; }
            .footer { text-align: center; margin-top: 40px; color: #999; font-size: 12px; }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const roleLabels: Record<string, string> = {
    restaurant: 'Restaurant Owner',
    homechef: 'HomeChef',
    driver: 'Delivery Partner',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Generate Tax Bill
          </DialogTitle>
        </DialogHeader>

        {!showBill ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Date Range Selection */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Select date range for tax calculation</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
              
              {/* Quick Select Buttons */}
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setStartDate(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
                    setEndDate(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
                  }}
                >
                  This Month
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const lastMonth = subDays(startOfMonth(new Date()), 1);
                    setStartDate(format(startOfMonth(lastMonth), 'yyyy-MM-dd'));
                    setEndDate(format(endOfMonth(lastMonth), 'yyyy-MM-dd'));
                  }}
                >
                  Last Month
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const year = new Date().getFullYear();
                    setStartDate(`${year}-01-01`);
                    setEndDate(`${year}-12-31`);
                  }}
                >
                  This Year
                </Button>
              </div>
            </div>

            {/* Preview */}
            <div className="bg-muted/50 p-4 rounded-lg space-y-3">
              <h4 className="font-semibold text-sm uppercase text-muted-foreground">Preview</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Orders</p>
                  <p className="text-xl font-bold">{filteredEarnings.length}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Earnings</p>
                  <p className="text-xl font-bold text-primary">{formatPKR(totalNet)}</p>
                </div>
              </div>
              <div className="flex justify-between pt-3 border-t border-border">
                <span className="text-muted-foreground">Tax Rate</span>
                <span className="font-semibold text-destructive">{(taxRate * 100).toFixed(0)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estimated Tax</span>
                <span className="font-semibold text-destructive">{formatPKR(taxAmount)}</span>
              </div>
            </div>

            <Button
              onClick={handleGenerateBill}
              className="w-full"
              disabled={filteredEarnings.length === 0}
            >
              <FileText className="w-4 h-4 mr-2" />
              Generate Tax Bill
            </Button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Printable Bill */}
            <div ref={billRef} className="space-y-4">
              <div className="header text-center pb-4 border-b-2 border-dashed">
                <h1 className="text-xl font-bold">TAX STATEMENT</h1>
                <p className="text-muted-foreground">
                  {format(new Date(startDate), 'MMM d, yyyy')} - {format(new Date(endDate), 'MMM d, yyyy')}
                </p>
              </div>

              {/* User Info */}
              <div className="section bg-muted/50 p-3 rounded-lg">
                <div className="row flex justify-between text-sm">
                  <span className="label text-muted-foreground">Name</span>
                  <span className="value font-medium">{user?.email?.split('@')[0] || 'User'}</span>
                </div>
                <div className="row flex justify-between text-sm mt-2">
                  <span className="label text-muted-foreground">Role</span>
                  <span className="value font-medium">{roleLabels[userType] || userType}</span>
                </div>
                <div className="row flex justify-between text-sm mt-2">
                  <span className="label text-muted-foreground">Tax Rate</span>
                  <span className="value font-medium">{(taxRate * 100).toFixed(0)}%</span>
                </div>
              </div>

              {/* Earnings Summary */}
              <div className="section">
                <h4 className="font-semibold text-sm uppercase text-muted-foreground mb-3">
                  Earnings Summary ({filteredEarnings.length} orders)
                </h4>
                
                <div className="space-y-2">
                  <div className="row flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Gross Earnings</span>
                    <span className="font-semibold">{formatPKR(totalGross)}</span>
                  </div>
                  <div className="row flex justify-between py-2 border-b text-destructive">
                    <span>Platform Commission</span>
                    <span className="font-semibold">-{formatPKR(totalCommission)}</span>
                  </div>
                  <div className="row flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Net Earnings</span>
                    <span className="font-bold text-primary">{formatPKR(totalNet)}</span>
                  </div>
                </div>
              </div>

              {/* Tax Calculation */}
              <div className="section summary bg-secondary/50 p-4 rounded-lg">
                <h4 className="font-semibold text-sm uppercase text-muted-foreground mb-3 flex items-center gap-2">
                  <Calculator className="w-4 h-4" />
                  Tax Calculation
                </h4>
                
                <div className="space-y-2">
                  <div className="row flex justify-between py-2">
                    <span className="text-muted-foreground">Taxable Income</span>
                    <span className="font-semibold">{formatPKR(totalNet)}</span>
                  </div>
                  <div className="row flex justify-between py-2 text-destructive">
                    <span>Tax ({(taxRate * 100).toFixed(0)}%)</span>
                    <span className="font-bold">-{formatPKR(taxAmount)}</span>
                  </div>
                  <div className="row flex justify-between py-3 border-t-2 border-dashed mt-2">
                    <span className="font-bold">Net Income After Tax</span>
                    <span className="font-bold text-lg text-emerald-600">{formatPKR(netAfterTax)}</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="footer text-center text-xs text-muted-foreground pt-4 border-t">
                <p>Generated on {format(new Date(), 'PPP')}</p>
                <p>This is a computer-generated document.</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 mt-4 border-t">
              <Button variant="outline" onClick={() => setShowBill(false)} className="flex-1">
                Back
              </Button>
              <Button onClick={handlePrint} className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                Print / Download
              </Button>
            </div>
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  );
}
