/**
 * VERSION SIMPLIFIÉE - Génère un billet sous forme d'image PNG
 * Sans dépendance html2canvas - utilise Canvas API natif
 */
export async function generateTicketImage(ticketData, eventData, qrCodeDataURL) {
  console.log('🎨 Démarrage génération billet...');
  console.log('📊 Données reçues:', { ticketData, eventData });

  try {
    // Créer un canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Dimensions
    const width = 600;
    let currentY = 0;

    // Calculer hauteur totale
    const hasImage = eventData.image_url ? 300 : 0;
    const height = hasImage + 800; // Hauteur approximative

    canvas.width = width;
    canvas.height = height;

    console.log('📐 Canvas créé:', width, 'x', height);

    // Fond blanc
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // === IMAGE DE COUVERTURE (si disponible) ===
    if (eventData.image_url) {
      try {
        console.log('📸 Chargement image événement:', eventData.image_url);
        const img = new Image();
        // ✅ Maintenant que le backend envoie les bons headers CORS
        img.crossOrigin = 'anonymous';

        await new Promise((resolve, reject) => {
          img.onload = () => {
            console.log('✅ Image événement chargée');
            ctx.drawImage(img, 0, 0, width, 300);
            currentY = 300;
            resolve();
          };
          img.onerror = () => {
            console.warn('⚠️ Impossible de charger l\'image');
            resolve(); // Continue sans image
          };
          img.src = `http://localhost:5000${eventData.image_url}`;
        });
      } catch (err) {
        console.warn('⚠️ Erreur chargement image:', err);
      }
    }

    // Padding
    const padding = 30;
    currentY += padding;

    // === TITRE ÉVÉNEMENT ===
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 32px Arial, sans-serif';
    ctx.textAlign = 'center';

    const titleLines = wrapText(ctx, eventData.title, width - padding * 2);
    titleLines.forEach(line => {
      ctx.fillText(line, width / 2, currentY);
      currentY += 40;
    });

    currentY += 20;

    // === LIEU ===
    ctx.fillStyle = '#4b5563';
    ctx.font = '18px Arial, sans-serif';
    ctx.fillText(`📍 ${eventData.location}`, width / 2, currentY);
    currentY += 30;

    // === DATE ===
    const eventDate = new Date(eventData.date_event);
    const formattedDate = eventDate.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const formattedTime = eventDate.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });

    ctx.fillStyle = '#6b7280';
    ctx.font = '16px Arial, sans-serif';
    ctx.fillText(`📅 ${formattedDate}`, width / 2, currentY);
    currentY += 25;
    ctx.fillText(`🕐 ${formattedTime}`, width / 2, currentY);
    currentY += 40;

    // === LIGNE SÉPARATRICE ===
    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(padding, currentY);
    ctx.lineTo(width - padding, currentY);
    ctx.stroke();
    currentY += 30;

    // === INFORMATIONS BILLET ===
    ctx.textAlign = 'left';
    ctx.fillStyle = '#374151';
    ctx.font = '16px Arial, sans-serif';

    const ticketInfo = [
      `🎟 Type: ${ticketData.ticket_type_name}`,
      `👤 Nom: ${ticketData.buyer_name}`,
      `📞 Téléphone: ${ticketData.buyer_phone}`
    ];

    ticketInfo.forEach(info => {
      ctx.fillText(info, padding + 20, currentY);
      currentY += 30;
    });

    // ID du billet avec police plus petite et wrapping
    ctx.fillStyle = '#6b7280';
    ctx.font = '12px monospace';
    const tokenText = `🆔 ID: ${ticketData.qr_token}`;

    // Wrapper le token s'il est trop long
    const maxTokenWidth = width - (padding + 20) * 2;
    const tokenLines = wrapText(ctx, tokenText, maxTokenWidth);

    tokenLines.forEach(line => {
      ctx.fillText(line, padding + 20, currentY);
      currentY += 20;
    });

    currentY += 20;

    // === QR CODE ===
    try {
      const qrImg = new Image();
      await new Promise((resolve, reject) => {
        qrImg.onload = () => {
          console.log('✅ QR Code chargé');
          const qrSize = 250;
          const qrX = (width - qrSize) / 2;
          ctx.drawImage(qrImg, qrX, currentY, qrSize, qrSize);
          currentY += qrSize + 20;
          resolve();
        };
        qrImg.onerror = reject;
        qrImg.src = qrCodeDataURL;
      });

      // Texte sous QR
      ctx.textAlign = 'center';
      ctx.fillStyle = '#667eea';
      ctx.font = 'bold 16px Arial, sans-serif';
      ctx.fillText('📱 Scanner à l\'entrée', width / 2, currentY);
      currentY += 40;

    } catch (err) {
      console.error('❌ Erreur QR Code:', err);
      throw new Error('Impossible de charger le QR Code');
    }

    // === FOOTER ===
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, currentY);
    ctx.lineTo(width - padding, currentY);
    ctx.stroke();
    currentY += 25;

    ctx.fillStyle = '#6b7280';
    ctx.font = '14px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Organisé par: ${eventData.organizer_name || 'Organisateur'}`, width / 2, currentY);
    currentY += 20;

    ctx.fillStyle = '#9ca3af';
    ctx.font = '12px Arial, sans-serif';
    ctx.fillText('Plateforme: TicketPro', width / 2, currentY);

    console.log('✅ Canvas dessiné');

    // === TÉLÉCHARGEMENT ===
    canvas.toBlob((blob) => {
      if (!blob) {
        alert('❌ Erreur: Impossible de créer l\'image');
        return;
      }

      console.log('✅ Blob créé:', blob.size, 'bytes');

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `billet-${ticketData.qr_token}.png`;
      document.body.appendChild(link);

      console.log('📥 Téléchargement...');
      link.click();

      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        console.log('✅ Billet téléchargé !');
      }, 100);
    }, 'image/png');

  } catch (error) {
    console.error('❌ ERREUR:', error);
    console.error('Stack:', error.stack);
    alert(`Erreur: ${error.message}\n\nVérifiez la console (F12) pour plus de détails.`);
    throw error;
  }
}

// Fonction helper pour wrapper le texte
function wrapText(ctx, text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = ctx.measureText(currentLine + ' ' + word).width;
    if (width < maxWidth) {
      currentLine += ' ' + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);
  return lines;
}

export default generateTicketImage;
