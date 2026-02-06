import React, { useState } from 'react';
import offlineService from '../services/offline.service';

/**
 * Bouton de préparation du mode hors-ligne
 */
const OfflineButton = ({ eventId, onPrepared }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handlePrepare = async () => {
        if (!eventId) {
            setError('Aucun événement sélectionné');
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const result = await offlineService.prepareOfflineMode(eventId);

            setSuccess(true);
            console.log('✅ Mode offline préparé:', result);

            if (onPrepared) {
                onPrepared(result);
            }

            // Masquer le message de succès après 3 secondes
            setTimeout(() => {
                setSuccess(false);
            }, 3000);
        } catch (err) {
            console.error('❌ Erreur préparation offline:', err);
            setError(err.response?.data?.message || err.message || 'Erreur de préparation');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ marginBottom: '20px' }}>
            <button
                onClick={handlePrepare}
                disabled={loading || !eventId}
                style={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '14px 24px',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: loading || !eventId ? 'not-allowed' : 'pointer',
                    opacity: loading || !eventId ? 0.6 : 1,
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                    if (!loading && eventId) {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
                    }
                }}
                onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                }}
            >
                {loading ? (
                    <>
                        <span>⏳</span>
                        <span>Préparation en cours...</span>
                    </>
                ) : (
                    <>
                        <span>📥</span>
                        <span>Préparer Mode Hors-Ligne</span>
                    </>
                )}
            </button>

            {success && (
                <div
                    style={{
                        marginTop: '12px',
                        padding: '12px',
                        background: '#d1fae5',
                        border: '2px solid #10b981',
                        borderRadius: '8px',
                        color: '#065f46',
                        fontSize: '14px',
                        textAlign: 'center',
                    }}
                >
                    ✅ Billets téléchargés ! Vous pouvez maintenant scanner hors-ligne.
                </div>
            )}

            {error && (
                <div
                    style={{
                        marginTop: '12px',
                        padding: '12px',
                        background: '#fee2e2',
                        border: '2px solid #ef4444',
                        borderRadius: '8px',
                        color: '#991b1b',
                        fontSize: '14px',
                        textAlign: 'center',
                    }}
                >
                    ❌ {error}
                </div>
            )}

            <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px', textAlign: 'center' }}>
                💡 Téléchargez les billets avant l'événement pour scanner sans connexion
            </p>
        </div>
    );
};

export default OfflineButton;
