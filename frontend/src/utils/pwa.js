/**
 * Service Worker Registration
 * Enregistre le service worker pour activer la PWA
 */

export const registerServiceWorker = () => {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker
                .register('/sw.js')
                .then((registration) => {
                    console.log('✅ Service Worker enregistré:', registration.scope);

                    // Vérifier les mises à jour
                    registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;

                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                // Nouveau contenu disponible
                                console.log('🔄 Nouvelle version disponible');

                                // Optionnel : Afficher une notification à l'utilisateur
                                if (confirm('Une nouvelle version est disponible. Recharger ?')) {
                                    newWorker.postMessage({ type: 'SKIP_WAITING' });
                                    window.location.reload();
                                }
                            }
                        });
                    });
                })
                .catch((error) => {
                    console.error('❌ Erreur enregistrement Service Worker:', error);
                });

            // Recharger quand un nouveau service worker prend le contrôle
            let refreshing = false;
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                if (!refreshing) {
                    refreshing = true;
                    window.location.reload();
                }
            });
        });
    } else {
        console.warn('⚠️ Service Worker non supporté par ce navigateur');
    }
};

/**
 * Vérifier si l'app est installée
 */
export const isAppInstalled = () => {
    return (
        window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true
    );
};

/**
 * Prompt d'installation PWA
 */
let deferredPrompt = null;

export const initInstallPrompt = () => {
    window.addEventListener('beforeinstallprompt', (e) => {
        // Empêcher le prompt automatique
        e.preventDefault();

        // Sauvegarder l'événement pour l'utiliser plus tard
        deferredPrompt = e;

        console.log('📱 PWA installable');

        // Afficher un bouton d'installation personnalisé
        showInstallButton();
    });

    // Détecter quand l'app est installée
    window.addEventListener('appinstalled', () => {
        console.log('✅ PWA installée');
        deferredPrompt = null;
        hideInstallButton();
    });
};

/**
 * Afficher le bouton d'installation
 */
const showInstallButton = () => {
    const installButton = document.getElementById('install-button');
    if (installButton) {
        installButton.style.display = 'block';
    }
};

/**
 * Cacher le bouton d'installation
 */
const hideInstallButton = () => {
    const installButton = document.getElementById('install-button');
    if (installButton) {
        installButton.style.display = 'none';
    }
};

/**
 * Déclencher l'installation
 */
export const installApp = async () => {
    if (!deferredPrompt) {
        console.warn('⚠️ Prompt d\'installation non disponible');
        return false;
    }

    // Afficher le prompt
    deferredPrompt.prompt();

    // Attendre la réponse de l'utilisateur
    const { outcome } = await deferredPrompt.userChoice;

    console.log(`Installation: ${outcome}`);

    // Réinitialiser le prompt
    deferredPrompt = null;

    return outcome === 'accepted';
};

/**
 * Vérifier le statut de connexion
 */
export const checkOnlineStatus = () => {
    return navigator.onLine;
};

/**
 * Écouter les changements de connexion
 */
export const listenToConnectionChanges = (onOnline, onOffline) => {
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    // Retourner une fonction de nettoyage
    return () => {
        window.removeEventListener('online', onOnline);
        window.removeEventListener('offline', onOffline);
    };
};
