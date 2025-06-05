
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MobileLayout from "@/components/MobileLayout";
import IssueTypeSelector from "@/components/issues/IssueTypeSelector";
import BankAccountChangeForm from "@/components/issues/BankAccountChangeForm";
import StandardIssueForm from "@/components/issues/StandardIssueForm";
import { useForm } from "react-hook-form";

const MobileNewIssue = () => {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState("");
  const [selectedSubType, setSelectedSubType] = useState("");
  
  const isBankAccountChange = selectedType === "personal" && selectedSubType === "bank-account";
  
  const form = useForm();

  const handleSuccess = () => {
    navigate("/mobile/issues");
  };

  const resetForm = () => {
    form.reset();
  };

  // Get user ID from localStorage (since we're not using Supabase auth)
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const employeeUuid = user.id || "";
  
  return (
    <MobileLayout title="Raise Ticket / टिकट बनाएँ" bgColor="bg-yulu-dashboard-blue">
      <div className="pb-16">
        <div className="space-y-6">
          <IssueTypeSelector 
            selectedType={selectedType}
            setSelectedType={setSelectedType}
            selectedSubType={selectedSubType}
            setSelectedSubType={setSelectedSubType}
            resetForm={resetForm}
            showHindi={true}
          />

          {selectedType && selectedSubType ? (
            <>
              {isBankAccountChange ? (
                <BankAccountChangeForm 
                  employeeUuid={employeeUuid}
                  selectedType={selectedType}
                  selectedSubType={selectedSubType}
                  onSuccess={handleSuccess}
                  showHindi={true}
                />
              ) : (
                <StandardIssueForm 
                  employeeUuid={employeeUuid}
                  selectedType={selectedType}
                  selectedSubType={selectedSubType}
                  onSuccess={handleSuccess}
                  showHindi={true}
                />
              )}
            </>
          ) : (
            <StandardIssueForm 
              employeeUuid={employeeUuid}
              selectedType="general"
              selectedSubType="other"
              onSuccess={handleSuccess}
              skipTypeValidation={true}
              showHindi={true}
            />
          )}
        </div>
      </div>
    </MobileLayout>
  );
};

export default MobileNewIssue;
