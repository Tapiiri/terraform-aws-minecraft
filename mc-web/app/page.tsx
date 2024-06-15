'use client';
import { useState } from 'react';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    setFile(selectedFile || null);
  };

  // Function to handle the upload action
  const handleUpload = async () => {
    if (file) {
      const formData = new FormData();
      formData.append('file', file);

      // API endpoint where you send the file
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      // Handle response here
      if (response.ok) {
        console.log('File uploaded successfully');
      } else {
        console.error('Upload failed');
      }
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        {/* Existing UI content */}
      </div>

      {/* File Upload Section */}
      <div className="upload-container">
        <input type="file" onChange={handleFileChange} />
        <button onClick={handleUpload} disabled={!file}>
          Upload Minecraft World
        </button>
      </div>

      <div className="before:bg-gradient-radial after:bg-gradient-conic relative z-[-1] flex place-items-center before:absolute before:h-[300px] before:w-full before:-translate-x-1/2 before:rounded-full before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-full after:translate-x-1/3 after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:lg:h-[360px]">
        {/* Existing UI content */}
      </div>
    </main>
  );
}
