import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

/**
 * Composant Scanner QR avec caméra
 * Utilise html5-qrcode pour scanner les billets
 */
const QRScanner = ({ onScanSuccess, onScanError }) => {
    const scannerRef = useRef(null);
    const [isScanning, setIsScanning] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Configuration du scanner
        const config = {
            fps: 10, // Images par seconde
            qrbox: { width: 250, height: 250 }, // Zone de scan
            aspectRatio: 1.0,
            disableFlip: false, // Permettre le flip de la caméra
        };

        // Créer le scanner
        const scanner = new Html5QrcodeScanner(
            'qr-reader',
            config,
            false // verbose
        );

        // Callback de succès
        const onSuccess = (decodedText, decodedResult) => {
            console.log('✅ QR Code scanné:', decodedText);

            // Vibration feedback
            if (navigator.vibrate) {
                navigator.vibrate([200, 100, 200]);
            }

            // Appeler le callback parent
            if (onScanSuccess) {
                onScanSuccess(decodedText, decodedResult);
            }

            setIsScanning(false);
        };

        // Callback d'erreur
        const onError = (errorMessage) => {
            // Ne pas logger les erreurs de scan normales
            if (!errorMessage.includes('NotFoundException')) {
                console.warn('⚠️ Erreur scan:', errorMessage);
            }
        };

        // Démarrer le scanner
        try {
            scanner.render(onSuccess, onError);
            setIsScanning(true);
            scannerRef.current = scanner;
        } catch (err) {
            console.error('❌ Erreur initialisation scanner:', err);
            setError(err.message);
            if (onScanError) {
                onScanError(err);
            }
        }

        // Cleanup
        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch((err) => {
                    console.error('Erreur nettoyage scanner:', err);
                });
            }
        };
    }, [onScanSuccess, onScanError]);

    return (
        <div style={{ width: '100%', maxWidth: '500px', margin: '0 auto' }}>
            {error && (
                <div
                    style={{
                        background: '#fee2e2',
                        color: '#991b1b',
                        padding: '15px',
                        borderRadius: '8px',
                        marginBottom: '15px',
                        textAlign: 'center',
                    }}
                >
                    <strong>❌ Erreur:</strong> {error}
                    <p style={{ fontSize: '14px', marginTop: '10px' }}>
                        Vérifiez les permissions de la caméra dans les paramètres de votre navigateur.
                    </p>
                </div>
            )}

            <div
                id="qr-reader"
                style={{
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                }}
            />

            {isScanning && (
                <p
                    style={{
                        textAlign: 'center',
                        color: '#6b7280',
                        marginTop: '15px',
                        fontSize: '14px',
                    }}
                >
                    📱 Positionnez le QR code dans le cadre
                </p>
            )}
        </div>
    );
};

export default QRScanner;
