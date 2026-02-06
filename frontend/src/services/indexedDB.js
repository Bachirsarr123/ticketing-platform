/**
 * IndexedDB Helper pour le cache local des billets
 * Permet le scan hors-ligne avec synchronisation automatique
 */

const DB_NAME = 'TicketProDB';
const DB_VERSION = 1;

// Stores (tables)
const STORES = {
    TICKETS: 'tickets',
    SCANS: 'scans',
    EVENTS: 'events',
};

/**
 * Ouvrir/créer la base de données
 */
export const openDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;

            // Store: tickets (billets en cache)
            if (!db.objectStoreNames.contains(STORES.TICKETS)) {
                const ticketStore = db.createObjectStore(STORES.TICKETS, {
                    keyPath: 'id',
                    autoIncrement: true,
                });
                ticketStore.createIndex('qr_token', 'qr_token', { unique: true });
                ticketStore.createIndex('event_id', 'event_id', { unique: false });
            }

            // Store: scans (queue de synchronisation)
            if (!db.objectStoreNames.contains(STORES.SCANS)) {
                const scanStore = db.createObjectStore(STORES.SCANS, {
                    keyPath: 'id',
                    autoIncrement: true,
                });
                scanStore.createIndex('synced', 'synced', { unique: false });
                scanStore.createIndex('qr_token', 'qr_token', { unique: false });
            }

            // Store: events (métadonnées événements)
            if (!db.objectStoreNames.contains(STORES.EVENTS)) {
                db.createObjectStore(STORES.EVENTS, {
                    keyPath: 'event_id',
                });
            }

            console.log('✅ IndexedDB initialisée');
        };
    });
};

/**
 * Sauvegarder les billets d'un événement
 */
export const saveTickets = async (eventId, tickets) => {
    const db = await openDB();
    const transaction = db.transaction([STORES.TICKETS, STORES.EVENTS], 'readwrite');
    const ticketStore = transaction.objectStore(STORES.TICKETS);
    const eventStore = transaction.objectStore(STORES.EVENTS);

    // Sauvegarder chaque billet
    for (const ticket of tickets) {
        const ticketData = {
            ...ticket,
            event_id: eventId,
            cached_at: new Date().toISOString(),
            is_used_offline: false, // Marqueur local
        };
        await ticketStore.put(ticketData);
    }

    // Sauvegarder métadonnées événement
    const eventData = {
        event_id: eventId,
        cached_at: new Date().toISOString(),
        tickets_count: tickets.length,
    };
    await eventStore.put(eventData);

    return transaction.complete;
};

/**
 * Récupérer un billet par son QR token
 */
export const getTicketByToken = async (qrToken) => {
    const db = await openDB();
    const transaction = db.transaction(STORES.TICKETS, 'readonly');
    const store = transaction.objectStore(STORES.TICKETS);
    const index = store.index('qr_token');

    return new Promise((resolve, reject) => {
        const request = index.get(qrToken);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

/**
 * Marquer un billet comme scanné (localement)
 */
export const markAsScanned = async (qrToken, timestamp) => {
    const db = await openDB();

    // 1. Mettre à jour le billet
    const ticketTransaction = db.transaction(STORES.TICKETS, 'readwrite');
    const ticketStore = ticketTransaction.objectStore(STORES.TICKETS);
    const ticketIndex = ticketStore.index('qr_token');

    const ticket = await new Promise((resolve, reject) => {
        const request = ticketIndex.get(qrToken);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });

    if (ticket) {
        ticket.is_used_offline = true;
        ticket.scanned_at_offline = timestamp;
        await ticketStore.put(ticket);
    }

    // 2. Ajouter à la queue de sync
    const scanTransaction = db.transaction(STORES.SCANS, 'readwrite');
    const scanStore = scanTransaction.objectStore(STORES.SCANS);

    const scanData = {
        qr_token: qrToken,
        scanned_at: timestamp,
        synced: false,
        sync_error: null,
        created_at: new Date().toISOString(),
    };

    await scanStore.add(scanData);

    return { ticket, scan: scanData };
};

/**
 * Récupérer la queue de synchronisation (scans non synchronisés)
 */
export const getSyncQueue = async () => {
    const db = await openDB();
    const transaction = db.transaction(STORES.SCANS, 'readonly');
    const store = transaction.objectStore(STORES.SCANS);
    const index = store.index('synced');

    return new Promise((resolve, reject) => {
        const request = index.getAll(false); // synced = false
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

/**
 * Marquer un scan comme synchronisé
 */
export const markScanAsSynced = async (scanId) => {
    const db = await openDB();
    const transaction = db.transaction(STORES.SCANS, 'readwrite');
    const store = transaction.objectStore(STORES.SCANS);

    const scan = await new Promise((resolve, reject) => {
        const request = store.get(scanId);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });

    if (scan) {
        scan.synced = true;
        scan.synced_at = new Date().toISOString();
        await store.put(scan);
    }

    return scan;
};

/**
 * Marquer un scan comme échoué
 */
export const markScanAsFailed = async (scanId, error) => {
    const db = await openDB();
    const transaction = db.transaction(STORES.SCANS, 'readwrite');
    const store = transaction.objectStore(STORES.SCANS);

    const scan = await new Promise((resolve, reject) => {
        const request = store.get(scanId);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });

    if (scan) {
        scan.sync_error = error;
        scan.sync_attempts = (scan.sync_attempts || 0) + 1;
        await store.put(scan);
    }

    return scan;
};

/**
 * Récupérer tous les billets d'un événement
 */
export const getEventTickets = async (eventId) => {
    const db = await openDB();
    const transaction = db.transaction(STORES.TICKETS, 'readonly');
    const store = transaction.objectStore(STORES.TICKETS);
    const index = store.index('event_id');

    return new Promise((resolve, reject) => {
        const request = index.getAll(eventId);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

/**
 * Récupérer les métadonnées d'un événement
 */
export const getEventMetadata = async (eventId) => {
    const db = await openDB();
    const transaction = db.transaction(STORES.EVENTS, 'readonly');
    const store = transaction.objectStore(STORES.EVENTS);

    return new Promise((resolve, reject) => {
        const request = store.get(eventId);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

/**
 * Nettoyer le cache d'un événement
 */
export const clearEventCache = async (eventId) => {
    const db = await openDB();

    // Supprimer les billets
    const ticketTransaction = db.transaction(STORES.TICKETS, 'readwrite');
    const ticketStore = ticketTransaction.objectStore(STORES.TICKETS);
    const ticketIndex = ticketStore.index('event_id');

    const tickets = await new Promise((resolve, reject) => {
        const request = ticketIndex.getAll(eventId);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });

    for (const ticket of tickets) {
        await ticketStore.delete(ticket.id);
    }

    // Supprimer les métadonnées
    const eventTransaction = db.transaction(STORES.EVENTS, 'readwrite');
    const eventStore = eventTransaction.objectStore(STORES.EVENTS);
    await eventStore.delete(eventId);

    console.log(`🗑️ Cache nettoyé pour événement ${eventId}`);
};

/**
 * Nettoyer tous les scans synchronisés
 */
export const clearSyncedScans = async () => {
    const db = await openDB();
    const transaction = db.transaction(STORES.SCANS, 'readwrite');
    const store = transaction.objectStore(STORES.SCANS);
    const index = store.index('synced');

    const syncedScans = await new Promise((resolve, reject) => {
        const request = index.getAll(true); // synced = true
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });

    for (const scan of syncedScans) {
        await store.delete(scan.id);
    }

    console.log(`🗑️ ${syncedScans.length} scans synchronisés nettoyés`);
};

/**
 * Obtenir le nombre de scans en attente
 */
export const getPendingScanCount = async () => {
    const queue = await getSyncQueue();
    return queue.length;
};

export default {
    openDB,
    saveTickets,
    getTicketByToken,
    markAsScanned,
    getSyncQueue,
    markScanAsSynced,
    markScanAsFailed,
    getEventTickets,
    getEventMetadata,
    clearEventCache,
    clearSyncedScans,
    getPendingScanCount,
};
