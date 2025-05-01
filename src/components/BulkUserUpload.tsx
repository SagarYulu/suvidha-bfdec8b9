
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

  // Force debug logs to track dialog visibility
  console.log("[BulkUserUpload] Rendering with showValidationDialog =", showValidationDialog);
  console.log("[BulkUserUpload] validationResults =", validationResults);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <TemplateControls 
          isUploading={isUploading}
          handleFileUpload={handleFileUpload}
        />
      </div>

      <FormatInstructions />

      {/* ValidationDialog must always be included in the render tree */}
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
