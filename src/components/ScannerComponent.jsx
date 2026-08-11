import React, { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

const ScannerComponent = ({ onScanSuccess, onScanFailure }) => {
  const scannerRef = useRef(null);
  const qrcodeRegionId = 'html5qr-code-full-region';

  useEffect(() => {
    let html5QrCode;
    
    // Create instance
    html5QrCode = new Html5Qrcode(qrcodeRegionId);
    scannerRef.current = html5QrCode;

    const config = { fps: 10, qrbox: { width: 250, height: 250 } };

    html5QrCode.start(
      { facingMode: 'environment' },
      config,
      (decodedText, decodedResult) => {
        if (onScanSuccess) {
          onScanSuccess(decodedText, decodedResult);
        }
      },
      (errorMessage) => {
        if (onScanFailure) {
          onScanFailure(errorMessage);
        }
      }
    ).catch((err) => {
      console.error('Error starting scanner: ', err);
    });

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().then(() => {
          scannerRef.current.clear();
        }).catch(err => console.error('Error stopping scanner:', err));
      }
    };
  }, []); // Empty dependency array so it only starts once per mount

  return <div id={qrcodeRegionId} style={{ width: '100%', maxWidth: '500px', margin: '0 auto', overflow: 'hidden', borderRadius: '8px', backgroundColor: '#000' }} />;
};

export default ScannerComponent;
