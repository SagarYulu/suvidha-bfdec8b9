
import { useState } from 'react';
import TemplateControls from './bulk-upload/TemplateControls';
import FormatInstructions from './bulk-upload/FormatInstructions';
import ValidationDialog from './bulk-upload/ValidationDialog';
import useBulkUpload from '@/hooks/useBulkUpload';

interface BulkUserUploadProps {
  onUploadSuccess?: () => void;
}

const BulkUserUpload = ({ onUploadSuccess }: BulkUserUploadProps) => {
  const {
    isUploading,
    showValidationDialog,
    setShowValidationDialog,
    validationResults,
    editedRows,
    handleFileUpload,
    handleFieldEdit,
    handleUploadEditedRows,
    handleProceedAnyway
  } = useBulkUpload(onUploadSuccess);

  // Add debug to see when dialog should open
  console.log("BulkUserUpload: showValidationDialog =", showValidationDialog);
  console.log("BulkUserUpload: validationResults =", validationResults);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <TemplateControls 
          isUploading={isUploading}
          handleFileUpload={handleFileUpload}
        />
      </div>

      <FormatInstructions />

      {/* The ValidationDialog component is always rendered, but only shown when showValidationDialog is true */}
      <ValidationDialog 
        isOpen={showValidationDialog}
        onOpenChange={setShowValidationDialog}
        validationResults={validationResults}
        editedRows={editedRows}
        isUploading={isUploading}
        handleFieldEdit={handleFieldEdit}
        handleUploadEditedRows={handleUploadEditedRows}
        handleProceedAnyway={handleProceedAnyway}
      />
    </div>
  );
};

export default BulkUserUpload;
