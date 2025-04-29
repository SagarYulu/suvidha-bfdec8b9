
const FormatInstructions = () => {
  return (
    <div className="text-sm text-muted-foreground">
      <p className="font-medium mb-2">CSV Format Instructions:</p>
      <ul className="list-disc list-inside space-y-1">
        <li>Required fields: User ID (id), Employee ID (emp_id), Name, Email, Role</li>
        <li><span className="font-medium text-amber-600">User ID must be a 7-digit number</span> (e.g., 1234567)</li>
        <li>Valid roles include: Mechanic, Pilot, Marshal, Zone Screener, etc.</li>
        <li>Valid cities: Bangalore, Delhi, Mumbai</li>
        <li>Each city has specific valid clusters</li>
        <li>Dates should be in DD-MM-YYYY format (or DD/MM/YYYY)</li>
        <li>Phone numbers should not include spaces or special characters</li>
        <li>Password will be set as 'changeme123' by default but can be edited</li>
        <li>Download the template for the correct format</li>
      </ul>
    </div>
  );
};

export default FormatInstructions;
