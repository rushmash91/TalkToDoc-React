import React from 'react';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import { makeStyles } from '@material-ui/core';

import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

const useStyles = makeStyles((theme) => ({
  viewer: {
    height: '100%',
    width: '100%',
    '& .rpv-core__viewer': {
      border: 'none',
    },
  },
}));

function PdfViewer({ fileUrl }) {
  const classes = useStyles();
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  return (
    <div className={classes.viewer}>
      <Worker workerUrl={`https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`}>
        <Viewer
          fileUrl={fileUrl}
          plugins={[defaultLayoutPluginInstance]}
        />
      </Worker>
    </div>
  );
}

export default PdfViewer;
