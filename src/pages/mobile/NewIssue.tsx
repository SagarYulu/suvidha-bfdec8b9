
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import MobileLayout from "@/components/MobileLayout";
import IssueTypeSelector from "@/components/issues/IssueTypeSelector";
import BankAccountChangeForm from "@/components/issues/BankAccountChangeForm";
import StandardIssueForm from "@/components/issues/StandardIssueForm";
import { useForm } from "react-hook-form";

const MobileNewIssue = () => {
  const { authState } = useAuth();
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
          />

          {selectedType && selectedSubType ? (
            <>
              {isBankAccountChange ? (
                <BankAccountChangeForm 
                  employeeUuid={authState.user?.id || ""}
                  selectedType={selectedType}
                  selectedSubType={selectedSubType}
                  onSuccess={handleSuccess}
                />
              ) : (
                <StandardIssueForm 
                  employeeUuid={authState.user?.id || ""}
                  selectedType={selectedType}
                  selectedSubType={selectedSubType}
                  onSuccess={handleSuccess}
                />
              )}
            </>
          ) : (
            <StandardIssueForm 
              employeeUuid={authState.user?.id || ""}
              selectedType="general"
              selectedSubType="other"
              onSuccess={handleSuccess}
              skipTypeValidation={true}
            />
          )}
        </div>
      </div>
    </MobileLayout>
  );
};

export default MobileNewIssue;
