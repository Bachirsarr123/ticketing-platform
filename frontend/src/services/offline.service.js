/**
 * Service de gestion du mode hors-ligne
 * Gère le téléchargement, la validation locale et la synchronisation
 */

import axios from 'axios';
import * as idb from './indexedDB';

const API_URL = 'http://localhost:5000';

/**
 * Vérifier l'état de la connexion
 */
export const isOffline = () => {
    return !navigator.onLine;
};

/**
 * Préparer le mode hors-ligne pour un événement
 * Télécharge tous les billets et les met en cache
 */
export const prepareOfflineMode = async (eventId) => {
    if (isOffline()) {
        throw new Error('Connexion internet requise pour préparer le mode hors-ligne');
    }

    try {
        console.log(`📥 Téléchargement des billets pour événement ${eventId}...`);

        // Récupérer le token d'authentification
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Non authentifié');
        }

        // Télécharger tous les billets de l'événement
        const response = await axios.get(
            `${API_URL}/api/tickets/event/${eventId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        const tickets = response.data;

        if (!tickets || tickets.length === 0) {
            throw new Error('Aucun billet trouvé pour cet événement');
        }

        // Sauvegarder dans IndexedDB
        await idb.saveTickets(eventId, tickets);

        console.log(`✅ ${tickets.length} billets mis en cache`);

        return {
            success: true,
            ticketsCount: tickets.length,
            eventId,
        };
    } catch (error) {
        console.error('❌ Erreur préparation offline:', error);
        throw error;
    }
};

/**
 * Valider un billet en mode hors-ligne
 */
export const validateTicketOffline = async (qrToken) => {
    try {
        console.log('🔍 Validation offline du billet:', qrToken);

        // Chercher le billet dans le cache
        const ticket = await idb.getTicketByToken(qrToken);

        if (!ticket) {
            return {
                success: false,
                message: 'Billet non trouvé dans le cache',
                error: 'NOT_CACHED',
            };
        }

        // Vérifier si déjà utilisé (localement)
        if (ticket.is_used_offline) {
            return {
                success: false,
                message: 'Billet déjà scanné (hors-ligne)',
                ticket,
                error: 'ALREADY_USED_OFFLINE',
            };
        }

        // Vérifier si déjà utilisé (serveur)
        if (ticket.is_used) {
            return {
                success: false,
                message: 'Billet déjà utilisé',
                ticket,
                error: 'ALREADY_USED',
            };
        }

        // Marquer comme scanné localement
        const timestamp = new Date().toISOString();
        await idb.markAsScanned(qrToken, timestamp);

        console.log('✅ Billet validé offline, ajouté à la queue de sync');

        return {
            success: true,
            message: 'Billet valide (hors-ligne)',
            ticket,
            offline: true,
            scanned_at: timestamp,
        };
    } catch (error) {
        console.error('❌ Erreur validation offline:', error);
        throw error;
    }
};

/**
 * Valider un billet (en ligne ou hors-ligne selon connexion)
 */
export const validateTicket = async (qrToken) => {
    // Vérifier d'abord si le billet a été scanné offline (même si on est en ligne)
    try {
        const cachedTicket = await idb.getTicketByToken(qrToken);
        if (cachedTicket && cachedTicket.is_used_offline) {
            console.log('⚠️ Billet déjà scanné offline, refus même en ligne');
            return {
                success: false,
                message: 'Billet déjà scanné (hors-ligne, en attente de sync)',
                ticket: cachedTicket,
                error: 'ALREADY_USED_OFFLINE',
            };
        }
    } catch (err) {
        console.log('ℹ️ Pas de cache local, validation normale');
    }

    // Si hors-ligne, utiliser la validation locale
    if (isOffline()) {
        return await validateTicketOffline(qrToken);
    }

    // Si en ligne, utiliser l'API
    try {
        const token = localStorage.getItem('token');
        const response = await axios.post(
            `${API_URL}/api/scan`,
            { qr_token: qrToken },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        return {
            success: true,
            message: response.data.message,
            ticket: response.data.ticket,
            offline: false,
        };
    } catch (error) {
        // Si erreur réseau, essayer validation offline
        if (error.code === 'ERR_NETWORK' || !navigator.onLine) {
            console.log('⚠️ Erreur réseau, basculement en mode offline');
            return await validateTicketOffline(qrToken);
        }

        throw error;
    }
};

/**
 * Synchroniser les scans en attente
 */
export const syncPendingScans = async () => {
    if (isOffline()) {
        throw new Error('Connexion internet requise pour synchroniser');
    }

    try {
        console.log('🔄 Synchronisation des scans en attente...');

        const queue = await idb.getSyncQueue();

        if (queue.length === 0) {
            console.log('✅ Aucun scan à synchroniser');
            return {
                success: true,
                synced: 0,
                failed: 0,
            };
        }

        const token = localStorage.getItem('token');
        let synced = 0;
        let failed = 0;

        for (const scan of queue) {
            try {
                // Envoyer le scan au serveur
                await axios.post(
                    `${API_URL}/api/scan`,
                    { qr_token: scan.qr_token },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                // Marquer comme synchronisé
                await idb.markScanAsSynced(scan.id);
                synced++;

                console.log(`✅ Scan synchronisé: ${scan.qr_token}`);
            } catch (error) {
                // Marquer comme échoué
                await idb.markScanAsFailed(scan.id, error.message);
                failed++;

                console.error(`❌ Échec sync: ${scan.qr_token}`, error.message);
            }
        }

        // Nettoyer les scans synchronisés
        if (synced > 0) {
            await idb.clearSyncedScans();
        }

        console.log(`🔄 Synchronisation terminée: ${synced} réussis, ${failed} échoués`);

        return {
            success: true,
            synced,
            failed,
            total: queue.length,
        };
    } catch (error) {
        console.error('❌ Erreur synchronisation:', error);
        throw error;
    }
};

/**
 * Obtenir le statut du mode hors-ligne
 */
export const getOfflineStatus = async (eventId) => {
    try {
        const metadata = await idb.getEventMetadata(eventId);
        const pendingScans = await idb.getPendingScanCount();

        return {
            isCached: !!metadata,
            cachedAt: metadata?.cached_at,
            ticketsCount: metadata?.tickets_count || 0,
            pendingScans,
            isOnline: !isOffline(),
        };
    } catch (error) {
        return {
            isCached: false,
            cachedAt: null,
            ticketsCount: 0,
            pendingScans: 0,
            isOnline: !isOffline(),
        };
    }
};

/**
 * Écouter les changements de connexion et synchroniser automatiquement
 */
export const setupAutoSync = (onSyncComplete) => {
    const handleOnline = async () => {
        console.log('🟢 Connexion rétablie, synchronisation automatique...');

        try {
            const result = await syncPendingScans();

            if (onSyncComplete) {
                onSyncComplete(result);
            }
        } catch (error) {
            console.error('❌ Erreur auto-sync:', error);
        }
    };

    window.addEventListener('online', handleOnline);

    // Retourner fonction de nettoyage
    return () => {
        window.removeEventListener('online', handleOnline);
    };
};

export default {
    isOffline,
    prepareOfflineMode,
    validateTicketOffline,
    validateTicket,
    syncPendingScans,
    getOfflineStatus,
    setupAutoSync,
};
