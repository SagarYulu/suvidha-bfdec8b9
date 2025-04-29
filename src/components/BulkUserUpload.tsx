
import { useState } from 'react';
import TemplateControls from './bulk-upload/TemplateControls';
import FormatInstructions from './bulk-upload/FormatInstructions';
import ValidationDialog from './bulk-upload/ValidationDialog';
import useBulkUpload from '@/hooks/useBulkUpload';

const BulkUserUpload = () => {
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
  } = useBulkUpload();

  return (
    <div className="space-y-4">
      <TemplateControls 
        isUploading={isUploading}
        handleFileUpload={handleFileUpload}
      />

      <FormatInstructions />

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
