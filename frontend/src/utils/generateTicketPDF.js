import jsPDF from 'jspdf';

/**
 * Generate a PDF ticket
 * @param {Object} ticketData - Ticket information
 * @param {Object} eventData - Event information
 * @param {string} qrCodeDataURL - QR code as data URL
 * @returns {jsPDF} PDF document
 */
export const generateTicketPDF = (ticketData, eventData, qrCodeDataURL) => {
    const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
    });

    // Colors
    const primaryColor = [99, 102, 241]; // #6366f1
    const secondaryColor = [16, 185, 129]; // #10b981
    const textColor = [31, 41, 55]; // #1f2937
    const lightGray = [243, 244, 246]; // #f3f4f6

    // Page dimensions
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Margins
    const margin = 20;
    const contentWidth = pageWidth - 2 * margin;

    // Header background
    pdf.setFillColor(...primaryColor);
    pdf.rect(0, 0, pageWidth, 50, 'F');

    // Title
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text('🎟️ BILLET D\'ENTRÉE', pageWidth / 2, 25, { align: 'center' });

    pdf.setTextColor(...textColor);

    // Event information section
    let yPos = 70;

    // Event title
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text(eventData.title, margin, yPos);
    yPos += 15;

    // Event details
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');

    // Location
    pdf.text(`📍 Lieu: ${eventData.location}`, margin, yPos);
    yPos += 10;

    // Date
    const eventDate = new Date(eventData.date_event).toLocaleString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
    pdf.text(`📅 Date: ${eventDate}`, margin, yPos);
    yPos += 20;

    // Separator line
    pdf.setDrawColor(...lightGray);
    pdf.setLineWidth(0.5);
    pdf.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 15;

    // Ticket information section
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Informations du billet', margin, yPos);
    yPos += 10;

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');

    // Ticket type
    pdf.text(`Type: ${ticketData.ticket_type_name}`, margin, yPos);
    yPos += 10;

    // Buyer name
    pdf.text(`Nom: ${ticketData.buyer_name}`, margin, yPos);
    yPos += 10;

    // Buyer phone
    pdf.text(`Téléphone: ${ticketData.buyer_phone}`, margin, yPos);
    yPos += 20;

    // QR Code section
    pdf.setDrawColor(...lightGray);
    pdf.setLineWidth(0.5);
    pdf.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 15;

    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Code QR de validation', margin, yPos);
    yPos += 10;

    // Add QR code image
    const qrSize = 80;
    const qrX = (pageWidth - qrSize) / 2;
    pdf.addImage(qrCodeDataURL, 'PNG', qrX, yPos, qrSize, qrSize);
    yPos += qrSize + 10;

    // Token
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(107, 114, 128); // gray-500
    pdf.text(`Token: ${ticketData.qr_token}`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 15;

    // Footer
    pdf.setDrawColor(...lightGray);
    pdf.setLineWidth(0.5);
    pdf.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 10;

    pdf.setFontSize(10);
    pdf.setTextColor(107, 114, 128);
    pdf.text(
        'Présentez ce billet à l\'entrée de l\'événement',
        pageWidth / 2,
        yPos,
        { align: 'center' }
    );
    yPos += 7;
    pdf.text(
        'Le QR code sera scanné pour valider votre accès',
        pageWidth / 2,
        yPos,
        { align: 'center' }
    );

    return pdf;
};

/**
 * Download ticket as PDF
 * @param {Object} ticketData - Ticket information
 * @param {Object} eventData - Event information
 * @param {string} qrCodeDataURL - QR code as data URL
 */
export const downloadTicketPDF = (ticketData, eventData, qrCodeDataURL) => {
    const pdf = generateTicketPDF(ticketData, eventData, qrCodeDataURL);
    const fileName = `billet-${eventData.title.replace(/\s+/g, '-')}-${ticketData.buyer_name.replace(/\s+/g, '-')}.pdf`;
    pdf.save(fileName);
};
