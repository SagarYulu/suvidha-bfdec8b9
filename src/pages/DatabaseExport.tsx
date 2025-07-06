
import DatabaseExportTool from '@/components/DatabaseExportTool';

const DatabaseExport = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Database Export
          </h1>
          <p className="text-lg text-gray-600">
            Export your complete database for standalone backend deployment
          </p>
        </div>
        
        <DatabaseExportTool />
      </div>
    </div>
  );
};

export default DatabaseExport;
