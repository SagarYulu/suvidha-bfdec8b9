
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreditCard } from 'lucide-react';

interface BankAccountChangeFormProps {
  onSubmit: (data: BankAccountChangeData) => void;
  isLoading?: boolean;
}

interface BankAccountChangeData {
  currentAccountNumber: string;
  newAccountNumber: string;
  newAccountHolderName: string;
  newIFSCCode: string;
  newBankName: string;
  reason: string;
  description: string;
}

const BankAccountChangeForm: React.FC<BankAccountChangeFormProps> = ({
  onSubmit,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<BankAccountChangeData>({
    currentAccountNumber: '',
    newAccountNumber: '',
    newAccountHolderName: '',
    newIFSCCode: '',
    newBankName: '',
    reason: '',
    description: ''
  });

  const reasons = [
    { value: 'account_closure', label: 'Previous Account Closed' },
    { value: 'bank_change', label: 'Changed Bank' },
    { value: 'incorrect_details', label: 'Incorrect Details' },
    { value: 'other', label: 'Other' }
  ];

  const handleInputChange = (field: keyof BankAccountChangeData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const isFormValid = () => {
    return formData.currentAccountNumber &&
           formData.newAccountNumber &&
           formData.newAccountHolderName &&
           formData.newIFSCCode &&
           formData.newBankName &&
           formData.reason &&
           formData.description;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Bank Account Change Request
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="currentAccount">Current Account Number</Label>
            <Input
              id="currentAccount"
              type="text"
              value={formData.currentAccountNumber}
              onChange={(e) => handleInputChange('currentAccountNumber', e.target.value)}
              placeholder="Enter current account number"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="newAccount">New Account Number</Label>
              <Input
                id="newAccount"
                type="text"
                value={formData.newAccountNumber}
                onChange={(e) => handleInputChange('newAccountNumber', e.target.value)}
                placeholder="Enter new account number"
                required
              />
            </div>

            <div>
              <Label htmlFor="accountHolder">Account Holder Name</Label>
              <Input
                id="accountHolder"
                type="text"
                value={formData.newAccountHolderName}
                onChange={(e) => handleInputChange('newAccountHolderName', e.target.value)}
                placeholder="Enter account holder name"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ifsc">IFSC Code</Label>
              <Input
                id="ifsc"
                type="text"
                value={formData.newIFSCCode}
                onChange={(e) => handleInputChange('newIFSCCode', e.target.value.toUpperCase())}
                placeholder="Enter IFSC code"
                required
              />
            </div>

            <div>
              <Label htmlFor="bankName">Bank Name</Label>
              <Input
                id="bankName"
                type="text"
                value={formData.newBankName}
                onChange={(e) => handleInputChange('newBankName', e.target.value)}
                placeholder="Enter bank name"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="reason">Reason for Change</Label>
            <Select value={formData.reason} onValueChange={(value) => handleInputChange('reason', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select reason" />
              </SelectTrigger>
              <SelectContent>
                {reasons.map(reason => (
                  <SelectItem key={reason.value} value={reason.value}>
                    {reason.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Provide additional details about the bank account change..."
              className="min-h-[100px]"
              required
            />
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={!isFormValid() || isLoading}
          >
            {isLoading ? 'Submitting...' : 'Submit Bank Account Change Request'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default BankAccountChangeForm;
