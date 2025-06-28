import { useState } from "react";
import { Calculator, CreditCard, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FeeEstimatorProps {
  isOpen: boolean;
  onClose: () => void;
  caseType?: string;
}

interface FeeBreakdown {
  courtFee: number;
  stampDuty: number;
  serviceCharges: number;
  advocateFee: number;
  total: number;
}

export function FeeEstimator({ isOpen, onClose, caseType = "" }: FeeEstimatorProps) {
  const [selectedCaseType, setSelectedCaseType] = useState(caseType);
  const [claimAmount, setClaimAmount] = useState("");
  const [feeBreakdown, setFeeBreakdown] = useState<FeeBreakdown | null>(null);

  const calculateFees = () => {
    const amount = parseFloat(claimAmount) || 0;
    let courtFee = 0;
    let stampDuty = 0;
    const serviceCharges = 500; // Fixed service charges
    const advocateFee = amount * 0.05; // 5% of claim amount

    // Fee calculation based on Court-Fee Act 1870 & Finance Act 2024
    switch (selectedCaseType) {
      case "civil":
        courtFee = Math.max(1000, amount * 0.02); // 2% of claim or minimum Rs. 1000
        stampDuty = Math.max(500, amount * 0.01); // 1% of claim or minimum Rs. 500
        break;
      case "property":
        courtFee = Math.max(2000, amount * 0.03); // 3% of claim or minimum Rs. 2000
        stampDuty = Math.max(1000, amount * 0.015); // 1.5% of claim or minimum Rs. 1000
        break;
      case "commercial":
        courtFee = Math.max(5000, amount * 0.025); // 2.5% of claim or minimum Rs. 5000
        stampDuty = Math.max(2500, amount * 0.012); // 1.2% of claim or minimum Rs. 2500
        break;
      case "family":
        courtFee = 1500; // Fixed fee for family matters
        stampDuty = 750; // Fixed stamp duty
        break;
      case "criminal":
        courtFee = 2000; // Fixed fee for criminal cases
        stampDuty = 1000; // Fixed stamp duty
        break;
      default:
        courtFee = 1000;
        stampDuty = 500;
    }

    const total = courtFee + stampDuty + serviceCharges + advocateFee;

    setFeeBreakdown({
      courtFee,
      stampDuty,
      serviceCharges,
      advocateFee,
      total
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <Card className="glass-modal w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="border-b border-white/20">
          <CardTitle className="text-white flex items-center">
            <Calculator className="h-5 w-5 mr-2 text-green-400" />
            Court Fee Estimator
          </CardTitle>
          <p className="text-white/70 text-sm">
            Calculate approximate court fees based on Pakistani court fee structure
          </p>
        </CardHeader>
        
        <CardContent className="p-6 space-y-6">
          {/* Case Type Selection */}
          <div className="space-y-2">
            <Label className="text-white">Case Type</Label>
            <Select value={selectedCaseType} onValueChange={setSelectedCaseType}>
              <SelectTrigger className="glass-card border-white/30 text-white">
                <SelectValue placeholder="Select case type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="civil">Civil Dispute</SelectItem>
                <SelectItem value="property">Property Dispute</SelectItem>
                <SelectItem value="commercial">Commercial/Corporate</SelectItem>
                <SelectItem value="family">Family Matter</SelectItem>
                <SelectItem value="criminal">Criminal Case</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Claim Amount */}
          <div className="space-y-2">
            <Label className="text-white">Claim Amount (PKR)</Label>
            <Input
              type="number"
              placeholder="Enter claim amount"
              value={claimAmount}
              onChange={(e) => setClaimAmount(e.target.value)}
              className="glass-card border-white/30 text-white placeholder:text-white/50"
            />
            <p className="text-white/60 text-xs">
              For non-monetary cases, enter an estimated value for fee calculation
            </p>
          </div>

          {/* Calculate Button */}
          <Button 
            onClick={calculateFees}
            className="w-full judicial-button-primary"
            disabled={!selectedCaseType || !claimAmount}
          >
            <Calculator className="h-4 w-4 mr-2" />
            Calculate Fees
          </Button>

          {/* Fee Breakdown */}
          {feeBreakdown && (
            <div className="space-y-4">
              <div className="border-t border-white/20 pt-4">
                <h3 className="text-white font-semibold mb-3">Fee Breakdown</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Court Fee</span>
                    <span className="text-white">PKR {feeBreakdown.courtFee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Stamp Duty</span>
                    <span className="text-white">PKR {feeBreakdown.stampDuty.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Service Charges</span>
                    <span className="text-white">PKR {feeBreakdown.serviceCharges.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Estimated Advocate Fee</span>
                    <span className="text-white">PKR {feeBreakdown.advocateFee.toLocaleString()}</span>
                  </div>
                  <div className="border-t border-white/20 pt-2">
                    <div className="flex justify-between items-center font-semibold">
                      <span className="text-white">Total Estimated Cost</span>
                      <span className="text-green-400 text-lg">PKR {feeBreakdown.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Options */}
              <div className="glass-card p-4">
                <h4 className="text-white font-medium mb-3">Payment Options</h4>
                <div className="grid grid-cols-2 gap-3">
                  <Button className="judicial-button-primary">
                    <CreditCard className="h-4 w-4 mr-2" />
                    JazzCash
                  </Button>
                  <Button className="judicial-button-success">
                    <CreditCard className="h-4 w-4 mr-2" />
                    EasyPaisa
                  </Button>
                </div>
                <p className="text-white/60 text-xs mt-2">
                  Fees are indicative; final challan issued after clerk vetting
                </p>
              </div>

              {/* Legal Notice */}
              <div className="glass-card p-4 border-yellow-500/30">
                <div className="flex items-start space-x-2">
                  <Check className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-white/70">
                    <p className="font-medium text-white mb-1">Legal Notice</p>
                    <p>Fee calculations are based on Court-Fee Act 1870 and Finance Act 2024 schedules. Actual fees may vary based on case complexity and court discretion.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-3 pt-4 border-t border-white/20">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-white/30 text-white hover:bg-white/10"
            >
              Close
            </Button>
            {feeBreakdown && (
              <Button className="flex-1 judicial-button-primary">
                Proceed to Payment
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}