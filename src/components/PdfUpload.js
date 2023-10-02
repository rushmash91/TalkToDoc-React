import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

function PdfUpload({ onFileUpload }) {
  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    onFileUpload(file);
  }, [onFileUpload]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: 'application/pdf',
  });

  return (
    <div {...getRootProps()} style={{ border: '2px dashed #cccccc', padding: '20px', textAlign: 'center' }}>
      <input {...getInputProps()} />
      <p>Drag & drop a PDF here, or click to select one</p>
    </div>
  );
}

export default PdfUpload;
