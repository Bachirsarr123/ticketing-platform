import React from 'react';

/**
 * Composant d'indicateur d'état de connexion
 */
const ConnectionStatus = ({ isOnline, pendingScans = 0 }) => {
    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderRadius: '8px',
                background: isOnline ? '#d1fae5' : '#fee2e2',
                border: `2px solid ${isOnline ? '#10b981' : '#ef4444'}`,
                marginBottom: '20px',
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '20px' }}>
                    {isOnline ? '🟢' : '🔴'}
                </span>
                <div>
                    <div style={{ fontWeight: '600', color: isOnline ? '#065f46' : '#991b1b' }}>
                        {isOnline ? 'En ligne' : 'Hors ligne'}
                    </div>
                    <div style={{ fontSize: '12px', color: isOnline ? '#047857' : '#b91c1c' }}>
                        {isOnline
                            ? 'Synchronisation automatique activée'
                            : 'Mode hors-ligne actif'}
                    </div>
                </div>
            </div>

            {pendingScans > 0 && (
                <div
                    style={{
                        background: '#fbbf24',
                        color: '#78350f',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: '600',
                    }}
                >
                    {pendingScans} scan{pendingScans > 1 ? 's' : ''} à synchroniser
                </div>
            )}
        </div>
    );
};

export default ConnectionStatus;
