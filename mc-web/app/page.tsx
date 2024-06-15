'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';

const triggerGitHubWorkflow = async (environment: string, type: string) => {
  const url = `https://api.github.com/repos/tapiiri/terraform-aws-minecraft/actions/workflows/deploy_environment.yml/dispatches`;
  const body = {
    ref: 'master',
    inputs: {
      environment: environment,
      type: type,
    },
  };
  console.log(
    'Triggering GitHub workflow:',
    body,
    process.env.NEXT_PUBLIC_GITHUB_TOKEN,
  );
  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      Accept: 'application/vnd.github.v3+json',
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_GITHUB_TOKEN}`, // Ensure this token has repo permissions
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub API responded with status ${response.status}`);
  }

  return await response.json();
};

export default function Home() {
  const [polling, setPolling] = useState<boolean>(false);
  const [type, setType] = useState<string>('');
  const [environment, setEnvironment] = useState<string>('');
  const [files, setFiles] = useState<File[]>([]);
  const [uploadStatus, setUploadStatus] = useState<string>('');

  const [deploymentDetails, setDeploymentDetails] = useState(null);

  // Polling function
  useEffect(() => {
    if (polling) {
      const interval = setInterval(async () => {
        try {
          const details = await fetch(
            `/api/upload?environment=${environment}`,
          ).then((res) => {
            console.log('Response:', res);
            return res.json();
          });
          console.log('Details:', details);
          if (details) {
            setDeploymentDetails(details);
            clearInterval(interval); // Stop polling once data is fetched
            setPolling(false);
          }
        } catch (error) {
          console.error('Failed to fetch deployment details', error);
        }
      }, 5000); // Poll every 5 seconds

      return () => clearInterval(interval);
    }
  }, [environment, polling]);

  const handleFolderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = event.target.files;
    if (!newFiles) return;
    const filteredFiles = Array.from(newFiles).filter(
      (file) => !file.name.startsWith('.'),
    );
    const fileList = Array.from(filteredFiles); // Convert FileList to Array
    // You can process the list to group by directory or handle as is
    fileList.forEach((file) => {
      console.log(file.webkitRelativePath); // This property shows path within the folder
    });
    setFiles(fileList);
  };

  const handleUpload = async () => {
    if (files && files.length > 0) {
      const formData = new FormData();
      // Append each file to the FormData object
      Array.from(files).forEach((file) => {
        formData.append('files', file, file.webkitRelativePath || file.name);
      });

      // API endpoint where you send the file
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      // Handle response here
      if (response.ok) {
        setUploadStatus('success');
        const resp = await response.json();
        console.log('Response:', resp);
        const [environment, type] = resp;
        setType(type);
        setEnvironment(environment);
        setPolling(true);
        triggerGitHubWorkflow(environment, type)
          .then((data) => console.log('Workflow dispatched successfully', data))
          .catch((error) =>
            console.error('Failed to dispatch workflow', error),
          );
      } else {
        setUploadStatus('error');
        console.error('Upload failed');
      }
    } else {
      console.log('No files to upload');
      setUploadStatus('error');
    }
  };
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-8">
      <div className="w-full max-w-4xl space-y-8">
        <h1 className="text-center text-3xl font-bold leading-tight text-gray-900">
          Upload Your Minecraft World
        </h1>

        {/* File Upload Section */}
        <div className="flex flex-col items-center justify-center">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="worldfile">Choose a world file</Label>
            <Input
              id="worldfile"
              type="file"
              webkitdirectory="true"
              directory="true"
              mozdirectory="true"
              multiple
              onChange={handleFolderChange}
            />
          </div>
          <Button
            color="primary"
            onClick={handleUpload}
            disabled={!files.length}
            className="mt-4"
          >
            Upload Minecraft World
          </Button>
        </div>
        {!!type && (
          <div className="w-full max-w-sm">
            <h2 className="text-lg font-medium text-gray-900">
              Your world ID is
            </h2>
            <p className="mt-2 text-sm text-gray-700">
              {type} {environment}
            </p>
            {deploymentDetails ? (
              <p className="mt-2 text-sm text-gray-700">
                Deployment is running at: {deploymentDetails['IP'] || 'Unknown'}
              </p>
            ) : (
              <p className="mt-2 text-sm text-gray-700">
                Deployment is in progress...
              </p>
            )}
          </div>
        )}
        {/* File List */}
        <div className="max-w-m w-full">
          <h2 className="text-lg font-medium text-gray-900">Files Selected</h2>
          <ul className="mt-2 space-y-1">
            {files.map((file) => (
              <li key={file.name} className="text-sm text-gray-700">
                {file.webkitRelativePath}
              </li>
            ))}
          </ul>
        </div>
        {/* Alerts for Feedback */}
        {uploadStatus === 'success' && (
          <Alert variant="default" className="mt-4">
            File uploaded successfully!
          </Alert>
        )}
        {uploadStatus === 'error' && (
          <Alert variant="destructive" className="mt-4">
            Upload failed. Please try again.
          </Alert>
        )}
      </div>
    </main>
  );
}
