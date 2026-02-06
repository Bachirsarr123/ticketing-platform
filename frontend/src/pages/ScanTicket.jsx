import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import QRScanner from '../components/QRScanner';
import ConnectionStatus from '../components/ConnectionStatus';
import OfflineButton from '../components/OfflineButton';
import offlineService from '../services/offline.service';
import axios from 'axios';

const API_URL = 'http://localhost:5000';

/**
 * Page de scan de billets (Organisateurs uniquement)
 */
const ScanTicket = () => {
    const navigate = useNavigate();
    const [scanResult, setScanResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [manualCode, setManualCode] = useState('');
    const [showManualInput, setShowManualInput] = useState(false);
    const [stats, setStats] = useState({ scanned: 0, total: 0 });

    // Offline mode states
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [pendingScans, setPendingScans] = useState(0);
    const [selectedEventId, setSelectedEventId] = useState(null);
    const [events, setEvents] = useState([]);
    const [loadingEvents, setLoadingEvents] = useState(true);

    // Charger les événements de l'organisateur
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${API_URL}/api/events/my`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                console.log('📅 Événements chargés:', response.data);
                setEvents(response.data);
                // Sélectionner automatiquement le premier événement
                if (response.data.length > 0) {
                    setSelectedEventId(response.data[0].id);
                }
            } catch (error) {
                console.error('❌ Erreur chargement événements:', error);
            } finally {
                setLoadingEvents(false);
            }
        };
        fetchEvents();
    }, []);

    // Écouter les changements de connexion
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Setup auto-sync
    useEffect(() => {
        const cleanup = offlineService.setupAutoSync(async (result) => {
            console.log('🔄 Auto-sync terminé:', result);

            // Mettre à jour le compteur de scans en attente
            const { pendingScans: pending } = await offlineService.getOfflineStatus(selectedEventId);
            setPendingScans(pending);

            // Afficher notification
            if (result.synced > 0) {
                setScanResult({
                    success: true,
                    message: `✅ ${result.synced} scan(s) synchronisé(s) !`,
                });
                setTimeout(() => setScanResult(null), 3000);
            }
        });

        return cleanup;
    }, [selectedEventId]);

    // Gérer le scan réussi
    const handleScanSuccess = async (decodedText) => {
        setLoading(true);
        setScanResult(null);

        try {
            // Extraire le token du QR code (format: "TICKET:token")
            console.log('📷 QR Code scanné (brut):', decodedText);

            const qrToken = decodedText.replace('TICKET:', '');

            console.log('🎫 Token extrait:', qrToken);
            console.log('🔍 Longueur token:', qrToken.length);

            // Valider le billet (online ou offline selon connexion)
            const result = await offlineService.validateTicket(qrToken);

            console.log('✅ Résultat validation:', result);

            // Succès
            setScanResult({
                success: result.success,
                message: result.message + (result.offline ? ' (Hors-ligne)' : ''),
                ticket: result.ticket,
                offline: result.offline,
            });

            // Mettre à jour le compteur de scans en attente si offline
            if (result.offline) {
                const status = await offlineService.getOfflineStatus(selectedEventId);
                setPendingScans(status.pendingScans);
            }

            // Son de succès (optionnel)
            playSuccessSound();

            // Mettre à jour les stats UNIQUEMENT si succès
            if (result.success) {
                setStats((prev) => ({ ...prev, scanned: prev.scanned + 1 }));
            }

        } catch (error) {
            console.error('❌ Erreur validation:', error);

            // Vibration d'erreur
            if (navigator.vibrate) {
                navigator.vibrate([100, 50, 100, 50, 100]);
            }

            setScanResult({
                success: false,
                message: error.response?.data?.message || 'Erreur de validation',
                error: error.response?.data,
            });

            // Son d'erreur (optionnel)
            playErrorSound();
        } finally {
            setLoading(false);
        }
    };

    // Gérer l'erreur de scan
    const handleScanError = (error) => {
        console.error('Erreur scan:', error);
    };

    // Validation manuelle
    const handleManualValidation = async (e) => {
        e.preventDefault();
        if (!manualCode.trim()) return;

        await handleScanSuccess(`TICKET:${manualCode.trim()}`);
        setManualCode('');
    };

    // Sons de feedback (optionnel)
    const playSuccessSound = () => {
        // Créer un son simple avec Web Audio API
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            gainNode.gain.value = 0.3;

            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.2);
        } catch (err) {
            // Ignorer si Web Audio API non supporté
        }
    };

    const playErrorSound = () => {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 200;
            oscillator.type = 'sawtooth';
            gainNode.gain.value = 0.3;

            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.3);
        } catch (err) {
            // Ignorer si Web Audio API non supporté
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '30px', textAlign: 'center' }}>
                <h1 style={{ fontSize: '32px', marginBottom: '10px' }}>📱 Scanner un Billet</h1>
                <p style={{ color: '#6b7280', fontSize: '16px' }}>
                    Scannez le QR code du billet pour valider l'entrée
                </p>
            </div>

            {/* Connection Status */}
            <ConnectionStatus isOnline={isOnline} pendingScans={pendingScans} />

            {/* Event Selection */}
            {!loadingEvents && events.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                        📅 Sélectionner un événement
                    </label>
                    <select
                        value={selectedEventId || ''}
                        onChange={(e) => setSelectedEventId(Number(e.target.value))}
                        style={{
                            width: '100%',
                            padding: '12px',
                            border: '2px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '16px',
                            background: 'white',
                            cursor: 'pointer',
                        }}
                    >
                        {events.map((event) => (
                            <option key={event.id} value={event.id}>
                                {event.title} - {new Date(event.date_event).toLocaleDateString('fr-FR')}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* Offline Preparation Button */}
            {selectedEventId ? (
                <OfflineButton
                    eventId={selectedEventId}
                    onPrepared={(result) => {
                        console.log('✅ Offline préparé:', result);
                    }}
                />
            ) : !loadingEvents && (
                <div style={{
                    padding: '16px',
                    background: '#fef3c7',
                    border: '2px solid #fbbf24',
                    borderRadius: '8px',
                    color: '#78350f',
                    marginBottom: '20px',
                    textAlign: 'center',
                }}>
                    ⚠️ Créez d'abord un événement pour utiliser le mode hors-ligne
                </div>
            )}

            {/* Stats */}
            <div
                style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    padding: '20px',
                    borderRadius: '12px',
                    marginBottom: '30px',
                    textAlign: 'center',
                }}
            >
                <div style={{ fontSize: '48px', fontWeight: 'bold' }}>{stats.scanned}</div>
                <div style={{ fontSize: '16px', opacity: 0.9 }}>Billets scannés</div>
            </div>

            {/* Scanner */}
            <div style={{ marginBottom: '30px' }}>
                <QRScanner onScanSuccess={handleScanSuccess} onScanError={handleScanError} />
            </div>

            {/* Résultat du scan */}
            {loading && (
                <div
                    style={{
                        background: '#f3f4f6',
                        padding: '20px',
                        borderRadius: '12px',
                        textAlign: 'center',
                        marginBottom: '20px',
                    }}
                >
                    <div style={{ fontSize: '24px', marginBottom: '10px' }}>⏳</div>
                    <div>Validation en cours...</div>
                </div>
            )}

            {scanResult && (
                <div
                    style={{
                        background: scanResult.success ? '#d1fae5' : '#fee2e2',
                        color: scanResult.success ? '#065f46' : '#991b1b',
                        padding: '20px',
                        borderRadius: '12px',
                        marginBottom: '20px',
                        border: `2px solid ${scanResult.success ? '#10b981' : '#ef4444'}`,
                    }}
                >
                    <div style={{ fontSize: '48px', textAlign: 'center', marginBottom: '15px' }}>
                        {scanResult.success ? '✅' : '❌'}
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', textAlign: 'center', marginBottom: '10px' }}>
                        {scanResult.message}
                    </div>
                    {scanResult.ticket && (
                        <div style={{ fontSize: '14px', marginTop: '15px', padding: '15px', background: 'rgba(255,255,255,0.5)', borderRadius: '8px' }}>
                            <div><strong>👤 Nom:</strong> {scanResult.ticket.buyer_name}</div>
                            <div><strong>📞 Téléphone:</strong> {scanResult.ticket.buyer_phone}</div>
                            <div><strong>🎟 Type:</strong> {scanResult.ticket.ticket_type_name}</div>
                        </div>
                    )}
                </div>
            )}

            {/* Saisie manuelle (fallback) */}
            <div style={{ marginTop: '30px' }}>
                <button
                    onClick={() => setShowManualInput(!showManualInput)}
                    style={{
                        background: 'transparent',
                        border: '2px solid #667eea',
                        color: '#667eea',
                        padding: '12px 24px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '16px',
                        width: '100%',
                        fontWeight: '600',
                    }}
                >
                    {showManualInput ? '📷 Retour au scan caméra' : '⌨️ Saisie manuelle'}
                </button>

                {showManualInput && (
                    <form onSubmit={handleManualValidation} style={{ marginTop: '15px' }}>
                        <input
                            type="text"
                            value={manualCode}
                            onChange={(e) => setManualCode(e.target.value)}
                            placeholder="Entrez le code du billet"
                            style={{
                                width: '100%',
                                padding: '15px',
                                border: '2px solid #d1d5db',
                                borderRadius: '8px',
                                fontSize: '16px',
                                marginBottom: '10px',
                            }}
                        />
                        <button
                            type="submit"
                            disabled={!manualCode.trim()}
                            style={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                border: 'none',
                                padding: '15px',
                                borderRadius: '8px',
                                cursor: manualCode.trim() ? 'pointer' : 'not-allowed',
                                fontSize: '16px',
                                width: '100%',
                                fontWeight: '600',
                                opacity: manualCode.trim() ? 1 : 0.5,
                            }}
                        >
                            ✅ Valider
                        </button>
                    </form>
                )}
            </div>

            {/* Bouton retour */}
            <button
                onClick={() => navigate('/organizer-dashboard')}
                style={{
                    background: '#f3f4f6',
                    color: '#374151',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    width: '100%',
                    marginTop: '20px',
                    fontWeight: '600',
                }}
            >
                ← Retour au Dashboard
            </button>
        </div>
    );
};

export default ScanTicket;
