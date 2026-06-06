const pool = require('../config/database');

const registrationController = {
  // Create registration
  async create(req, res) {
    try {
      const {
        firstName,
        lastName,
        email,
        phone,
        company,
        position,
        country,
        events,
        interests,
        dietaryRequirements
      } = req.body;

      // Basic validation
      if (!firstName || !lastName || !email || !phone || !company || !position || !country || !events) {
        return res.status(400).json({
          success: false,
          message: 'Required fields missing'
        });
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid email format'
        });
      }

      // Check if email already exists
      const [existingUser] = await pool.execute(
        'SELECT id FROM registrations WHERE email = ?',
        [email]
      );

      if (existingUser.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Email already registered'
        });
      }

      // Insert new registration
      const [result] = await pool.execute(
        `INSERT INTO registrations (
          first_name, last_name, email, phone, company, position, 
          country, events, interests, dietary_requirements
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          firstName,
          lastName,
          email,
          phone,
          company,
          position,
          country,
          JSON.stringify(events),
          JSON.stringify(interests || []),
          dietaryRequirements || null
        ]
      );

      res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: {
          id: result.insertId,
          email: email
        }
      });

    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Registration failed'
      });
    }
  },

  // Get all registrations
  async getAll(req, res) {
    try {
      const [rows] = await pool.execute(`
        SELECT 
          id, first_name, last_name, email, phone, company, position,
          country, events, interests, dietary_requirements, registration_date
        FROM registrations 
        ORDER BY registration_date DESC
      `);

      // Parse JSON fields
      const registrations = rows.map(row => ({
        id: row.id,
        firstName: row.first_name,
        lastName: row.last_name,
        email: row.email,
        phone: row.phone,
        company: row.company,
        position: row.position,
        country: row.country,
        events: JSON.parse(row.events),
        interests: JSON.parse(row.interests || '[]'),
        dietaryRequirements: row.dietary_requirements,
        registrationDate: row.registration_date
      }));

      res.json({
        success: true,
        data: registrations
      });

    } catch (error) {
      console.error('Get registrations error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve registrations'
      });
    }
  },

  // Delete registration
  async delete(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid registration ID'
        });
      }

      const [result] = await pool.execute(
        'DELETE FROM registrations WHERE id = ?',
        [id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'Registration not found'
        });
      }

      res.json({
        success: true,
        message: 'Registration deleted successfully'
      });

    } catch (error) {
      console.error('Delete registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete registration'
      });
    }
  }
};

module.exports = registrationController;