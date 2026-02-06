const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// ================= MIDDLEWARES =================
app.use(cors());
app.use(express.json());

// ✅ CORS pour les images uploadées (fix "Tainted canvas")
app.use('/uploads', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
});

// Servir les fichiers statiques (images uploadées)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ================= ROUTES =================
const authRoutes = require('./routes/auth.routes');
const eventRoutes = require('./routes/event.routes');
const ticketTypeRoutes = require('./routes/ticketType.routes');
const purchaseRoutes = require('./routes/purchase.routes');
const scanRoutes = require('./routes/scan.routes');
const ticketRoutes = require('./routes/ticket.routes');
const adminRoutes = require('./routes/admin.routes');
const uploadRoutes = require('./routes/upload.routes');

// ⚠️ BRANCHEMENT DES ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/ticket-types', ticketTypeRoutes);
app.use('/api/purchase', purchaseRoutes);
app.use('/api/scan', scanRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);

// ================= TEST =================
app.get('/', (req, res) => {
  res.send('API Ticketing fonctionne ✅');
});

// ================= DB =================
const pool = require('./db');

pool.query('SELECT NOW()', (err, result) => {
  if (err) {
    console.error('❌ Erreur PostgreSQL', err);
  } else {
    console.log('✅ PostgreSQL connecté :', result.rows[0]);
  }
});

// ================= SERVER =================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur le port ${PORT}`);
});
