const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../migrate');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/login
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    if (user.status !== 'active') return res.status(403).json({ error: 'Account is not active' });

    const valid = bcrypt.compareSync(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    // Update last login
    db.prepare('UPDATE users SET last_login = datetime("now") WHERE user_id = ?').run(user.user_id);

    const token = jwt.sign(
      { userId: user.user_id, role: user.role, institutionId: user.institution_id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Get institution info if applicable
    let institution = null;
    if (user.institution_id) {
      institution = db.prepare('SELECT institution_id, name_en, name_zh, institution_type, sectors, regulators FROM institutions WHERE institution_id = ?').get(user.institution_id);
      if (institution) {
        institution.sectors = JSON.parse(institution.sectors);
        institution.regulators = JSON.parse(institution.regulators);
      }
    }

    res.json({
      token,
      user: {
        user_id: user.user_id,
        email: user.email,
        name_en: user.name_en,
        is_demo_account: Number(user.is_demo_account || 0) === 1,
        role: user.role,
        regulator: user.regulator,
        institution_id: user.institution_id,
      },
      institution,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/me
router.get('/me', authenticate, (req, res) => {
  let institution = null;
  if (req.user.institution_id) {
    institution = db.prepare('SELECT institution_id, name_en, name_zh, institution_type, sectors, regulators FROM institutions WHERE institution_id = ?').get(req.user.institution_id);
    if (institution) {
      institution.sectors = JSON.parse(institution.sectors);
      institution.regulators = JSON.parse(institution.regulators);
    }
  }
  res.json({
    user: {
      user_id: req.user.user_id,
      email: req.user.email,
      name_en: req.user.name_en,
      is_demo_account: Number(req.user.is_demo_account || 0) === 1,
      role: req.user.role,
      regulator: req.user.regulator,
      institution_id: req.user.institution_id,
    },
    institution,
  });
});

module.exports = router;
