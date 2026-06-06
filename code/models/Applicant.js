const db = require('../config/database');

class Applicant {

    /**
     * Creates a new applicant record in the database.
     * @param {object} data - Applicant data object.
     * @returns {Promise<object>} The result of the database insertion.
     */
    static async create(data) {
        const sql = `
            INSERT INTO applicants (
                firstname, lastname, gender, national_id, nid_photo,
                company_name, tin_number, full_ownership, years_in_business,
                business_experience, email, phone_number, is_member,
                membership_type, membership_card, cv_resume, other_document,
                election_level, position_role, chamber_selected,
                province_selected, district_selected
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await db.execute(sql, [
            data.firstname,
            data.lastname,
            data.gender,
            data.national_id,
            data.nid_photo || null,
            data.company_name,
            data.tin_number,
            data.full_ownership,
            data.years_in_business,
            data.business_experience,
            data.email || null,
            data.phone_number,
            data.is_member,
            data.membership_type || null,
            data.membership_card || null,
            data.cv_resume,
            data.other_document || null,
            data.election_level,
            data.position_role,
            data.chamber_selected || null,
            data.province_selected || null,
            data.district_selected || null
        ]);

        return result;
    }

    /**
     * Retrieves all applicants, ordered by creation date.
     * @returns {Promise<Array<object>>} Array of applicant records.
     */
    static async findAll() {
        const sql = `SELECT * FROM applicants ORDER BY created_at DESC`;
        const [rows] = await db.execute(sql);
        return rows;
    }

    /**
     * Retrieves applicants filtered by election level.
     * @param {string} level - The election level to filter by.
     * @returns {Promise<Array<object>>} Array of applicant records.
     */
    static async findByElectionLevel(level) {
        const sql = `SELECT * FROM applicants WHERE election_level = ? ORDER BY created_at DESC`;
        const [rows] = await db.execute(sql, [level]);
        return rows;
    }

    /**
     * Retrieves applicants filtered by election level and position role.
     * @param {string} level - The election level.
     * @param {string} position - The position role.
     * @returns {Promise<Array<object>>} Array of applicant records.
     */
    static async findByLevelAndPosition(level, position) {
        const sql = `SELECT * FROM applicants WHERE election_level = ? AND position_role = ? ORDER BY created_at DESC`;
        const [rows] = await db.execute(sql, [level, position]);
        return rows;
    }

    /**
     * Gets statistics (count) of applicants grouped by election level and position.
     * @returns {Promise<Array<object>>} Array of statistics objects.
     */
    static async getStatsByLevel() {
        const sql = `
            SELECT election_level, position_role, COUNT(*) as count
            FROM applicants
            GROUP BY election_level, position_role
            ORDER BY election_level, position_role
        `;
        const [rows] = await db.execute(sql);
        return rows;
    }

    /**
     * Finds a single applicant by their ID.
     * @param {number} id - The applicant ID.
     * @returns {Promise<object|undefined>} The applicant record or undefined.
     */
    static async findById(id) {
        const sql = `SELECT * FROM applicants WHERE id = ?`;
        const [rows] = await db.execute(sql, [id]);
        return rows[0];
    }

    /**
     * Searches and filters applicants based on provided criteria.
     * @param {object} filters - An object containing filtering criteria.
     * @returns {Promise<Array<object>>} Array of filtered applicant records.
     */
    static async searchApplicants(filters) {
        let sql = `SELECT * FROM applicants WHERE 1 = 1`;
        const params = [];

        if (filters.election_level) {
            sql += ` AND election_level = ?`;
            params.push(filters.election_level);
        }
        if (filters.position_role) {
            sql += ` AND position_role = ?`;
            params.push(filters.position_role);
        }
        if (filters.chamber_selected) {
            sql += ` AND chamber_selected = ?`;
            params.push(filters.chamber_selected);
        }
        if (filters.province_selected) {
            sql += ` AND province_selected = ?`;
            params.push(filters.province_selected);
        }
        if (filters.district_selected) {
            sql += ` AND district_selected = ?`;
            params.push(filters.district_selected);
        }
        if (filters.is_member) {
            sql += ` AND is_member = ?`;
            params.push(filters.is_member);
        }
        if (filters.search) {
            sql += ` AND (firstname LIKE ? OR lastname LIKE ? OR national_id LIKE ? OR phone_number LIKE ?)`;
            const searchTerm = `%${filters.search}%`;
            params.push(searchTerm, searchTerm, searchTerm, searchTerm);
        }

        sql += ` ORDER BY created_at DESC`;

        const [rows] = await db.execute(sql, params);
        return rows;
    }
}

module.exports = Applicant;