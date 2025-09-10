import { AlertTriangle, Upload } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export const FileUploadNote = () => {
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.name === 'dns_output.txt') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        // Here you would parse the content and update the packets state
        console.log('File content:', content);
        // You can emit an event or use a callback to update the parent component
      };
      reader.readAsText(file);
    }
  };

  return (
    <Alert className="mb-6 border-accent/50 bg-accent/10">
      <AlertTriangle className="h-4 w-4 text-accent" />
      <AlertTitle className="text-accent">Real File Integration</AlertTitle>
      <AlertDescription className="mt-2 space-y-3">
        <p>
          To connect with your C program's output, you'll need a simple backend service since browsers can't directly read local files.
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="file"
            accept=".txt"
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload">
            <Button variant="outline" size="sm" className="cursor-pointer" asChild>
              <span>
                <Upload className="h-4 w-4 mr-2" />
                Upload dns_output.txt
              </span>
            </Button>
          </label>
          <span className="text-sm text-muted-foreground">
            For now, you can manually upload the file for testing
          </span>
        </div>
      </AlertDescription>
    </Alert>
  );
};