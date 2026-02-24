const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { db, init, migrate } = require('./migrate');

async function start() {
  // Startup order matters for debugging: DB init must succeed before routes are mounted,
  // otherwise handlers that call `db.prepare(...)` fail with less obvious runtime errors.
  await init();
  migrate();

  // Auto-seed on first run: if the users table is empty, populate demo data.
  // Uses INSERT OR IGNORE so it's safe even if partially seeded.
  const userCount = db.prepare('SELECT COUNT(*) as cnt FROM users').get();
  if (!userCount || userCount.cnt === 0) {
    console.log('🌱 Empty database detected — running seed...');
    const { seed } = require('./seed');
    await seed();
    console.log('🌱 Seed complete.');
  }

  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(morgan('dev'));

  // Keep API route registration centralized here so missing/typo route prefixes
  // can be diagnosed quickly from a single file during incident triage.
  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/institutions', require('./routes/institutions'));
  app.use('/api/individuals', require('./routes/individuals'));
  app.use('/api/requests', require('./routes/requests'));
  app.use('/api/consents', require('./routes/consents'));
  app.use('/api/dashboard', require('./routes/dashboard'));
  app.use('/api/hkma', require('./routes/hkma'));
  app.use('/api/integrations', require('./routes/integrations'));

  // In production this serves the compiled frontend. If `index.html` is missing,
  // confirm `frontend/dist` exists (run frontend build before backend start).
  const frontendPath = path.join(__dirname, '../../frontend/dist');
  app.use(express.static(frontendPath));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(frontendPath, 'index.html'));
    } else {
      res.status(404).json({ error: 'API endpoint not found' });
    }
  });

  // Last-resort handler for uncaught route errors.
  // Keep stack logging enabled for debugging (especially startup/route wiring bugs).
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal server error' });
  });

  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`\n🏛️  MRCS Platform API running on http://localhost:${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   API docs: http://localhost:${PORT}/api\n`);
  });
}

start().catch(err => {
  // Fatal startup errors (env, db init, migrations) terminate process here.
  console.error('Failed to start MRCS Platform:', err);
  process.exit(1);
});
