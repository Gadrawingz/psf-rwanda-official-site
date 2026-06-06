const pool = require('../config/database');

// Company Model
class CompanyModel {

    async generateUniqueId() {
        try {
            const generateId = () => {
                return Math.floor(10000000 + Math.random() * 90000000).toString().substring(0, 8);
            };

            let uniqueId = generateId();
            const maxAttempts = 10;
            let attempts = 0;

            while (attempts < maxAttempts) {
                const [rows] = await pool.query(
                    'SELECT COUNT(*) as count FROM membership_companies WHERE unique_id = ?',
                    [uniqueId]
                );

                if (rows[0].count === 0) {
                    return uniqueId;
                }

                uniqueId = generateId();
                attempts++;
            }

            throw new Error('Could not generate unique ID after maximum attempts');
        } catch (error) {
            console.error('Error generating unique ID:', error.message);
            throw error;
        }
    }

    static async findAll(userId) {
        try {
            const [rows] = await pool.query(`
                SELECT 
                    c.*, 
                    vl.village_name, 
                    cl.cell_name, 
                    sc.sector_name, 
                    d.district_name, 
                    p.province_name, 
                    ass.assoc_name, 
                    ass.leader_name, 
                    ass.leader_position, 
                    cr.cluster_name, 
                    ct.type_name AS company_type, 
                    mo.ownership_name, 
                    r.member_id, 
                    r.firstname, 
                    r.lastname, 
                    r.gender, 
                    r.birthday, 
                    r.telephone AS rep_telephone, 
                    r.email AS rep_email, 
                    r.national_id, 
                    r.passport_number, 
                    r.has_insurance, 
                    r.preferred_language, 
                    r.areas_of_interest, 
                    r.is_approved, 
                    r.registered_by, 
                    mc.category_name 
                FROM 
                    membership_companies c 
                LEFT JOIN 
                    membership_representatives r ON c.company_id = r.company_id 
                LEFT JOIN 
                    associations ass ON ass.assoc_id = c.association_id 
                LEFT JOIN 
                    clusters cr ON cr.cluster_id = ass.cluster_id 
                LEFT JOIN 
                    membership_co_types ct ON ct.type_id = c.company_type_id 
                LEFT JOIN 
                    membership_ownerships mo ON mo.ownership_id = c.ownership_id 
                LEFT JOIN 
                    membership_categories mc ON mc.category_id = c.membership_category 
                LEFT JOIN 
                    villages vl ON vl.village_id = c.village_id 
                LEFT JOIN 
                    cells cl ON cl.cell_id = c.cell_id 
                LEFT JOIN 
                    sectors sc ON sc.sector_id = c.sector_id 
                LEFT JOIN 
                    districts d ON c.district_id = d.district_id 
                LEFT JOIN 
                    provinces p ON d.province_id = p.province_id 
                WHERE 
                    r.registered_by = ? 
                ORDER BY 
                    c.created_at DESC 
                LIMIT 100
            `, [userId]);
            return rows;
        } catch (error) {
            console.error('Error in CompanyModel.findAll:', error.message);
            throw error;
        }
    }

    static async findById(id) {
        try {
            const [rows] = await pool.query(`
                SELECT 
                    c.*, 
                    vl.village_name, 
                    cl.cell_name, 
                    sc.sector_name, 
                    d.district_name, 
                    p.province_name, 
                    ass.assoc_name, 
                    ass.leader_name, 
                    ass.leader_position, 
                    cr.cluster_name, 
                    ct.type_name AS company_type, 
                    mo.ownership_name, 
                    r.member_id, 
                    r.firstname, 
                    r.lastname, 
                    r.gender, 
                    r.birthday, 
                    r.telephone AS rep_telephone, 
                    r.email AS rep_email, 
                    r.national_id, 
                    r.passport_number, 
                    r.has_insurance, 
                    r.preferred_language, 
                    r.areas_of_interest, 
                    r.is_approved, 
                    r.registered_by, 
                    mc.category_name 
                FROM 
                    membership_companies c 
                LEFT JOIN 
                    membership_representatives r ON c.company_id = r.company_id 
                LEFT JOIN 
                    associations ass ON ass.assoc_id = c.association_id 
                LEFT JOIN 
                    clusters cr ON cr.cluster_id = ass.cluster_id 
                LEFT JOIN 
                    membership_co_types ct ON ct.type_id = c.company_type_id 
                LEFT JOIN 
                    membership_ownerships mo ON mo.ownership_id = c.ownership_id 
                LEFT JOIN 
                    membership_categories mc ON mc.category_id = c.membership_category 
                LEFT JOIN 
                    villages vl ON vl.village_id = c.village_id 
                LEFT JOIN 
                    cells cl ON cl.cell_id = c.cell_id 
                LEFT JOIN 
                    sectors sc ON sc.sector_id = c.sector_id 
                LEFT JOIN 
                    districts d ON c.district_id = d.district_id 
                LEFT JOIN 
                    provinces p ON d.province_id = p.province_id 
                WHERE 
                    c.company_id = ?
            `, [id]);
            return rows[0];
        } catch (error) {
            console.error('Error in CompanyModel.findById:', error.message);
            throw error;
        }
    }

    static async create(companyData, representativeData) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            const [companyResult] = await connection.query(`
                INSERT INTO membership_companies(
                    company_tin, registration_type, registration_number, company_name, company_phone, 
                    company_email, company_website, business_activity, business_size, company_type_id, 
                    ownership_id, permanent_employees, casual_employees, has_association, association_id, 
                    assoc_contributor, district_id, sector_id, cell_id, village_id, street_zone, 
                    sales_reporting, membership_category, membership_status, business_scope, int_countries, 
                    local_places
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                companyData.company_tin,
                companyData.registration_type,
                companyData.registration_number,
                companyData.company_name,
                companyData.company_phone,
                companyData.company_email,
                companyData.company_website,
                companyData.business_activity,
                companyData.business_size,
                companyData.company_type_id,
                companyData.ownership_id,
                companyData.permanent_employees,
                companyData.casual_employees,
                companyData.has_association,
                companyData.association_id,
                companyData.assoc_contributor,
                companyData.district_id,
                companyData.sector_id,
                companyData.cell_id,
                companyData.village_id,
                companyData.street_zone,
                companyData.sales_reporting,
                companyData.membership_category,
                companyData.membership_status,
                companyData.business_scope,
                companyData.int_countries,
                companyData.local_places
            ]);

            const companyId = companyResult.insertId;

            await connection.query(`
                INSERT INTO membership_representatives(
                    company_id, firstname, lastname, gender, telephone, email, national_id, 
                    passport_number, birthday, has_insurance, preferred_language, areas_of_interest, 
                    registered_by
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                companyId,
                representativeData.firstname,
                representativeData.lastname,
                representativeData.gender,
                representativeData.telephone,
                representativeData.rep_email,
                representativeData.national_id,
                representativeData.passport_number,
                representativeData.birthday,
                representativeData.has_insurance,
                representativeData.preferred_language,
                representativeData.areas_of_interest,
                representativeData.registered_by
            ]);

            await connection.commit();

            return companyId;
        } catch (error) {
            await connection.rollback();
            console.error('Error in CompanyModel.create:', error);
            throw error;
        } finally {
            connection.release();
        }
    }

    static async delete(id) {
        try {
            const [result] = await pool.query('DELETE FROM membership_companies WHERE company_id = ?', [id]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error in CompanyModel.delete:', error.message);
            throw error;
        }
    }

    static async search(term) {
        try {
            const [rows] = await pool.query(`
                SELECT 
                    c.*, 
                    r.member_id, 
                    r.firstname, 
                    r.lastname, 
                    r.gender, 
                    r.telephone AS rep_telephone, 
                    r.email AS rep_email, 
                    r.national_id 
                FROM 
                    membership_companies c 
                LEFT JOIN 
                    membership_representatives r ON c.company_id = r.company_id
                WHERE 
                    c.company_name LIKE ? 
                    OR c.business_activity LIKE ? 
                    OR r.firstname LIKE ? 
                    OR r.lastname LIKE ? 
                    OR c.sector_id LIKE ? 
            `, [`%${term}%`, `%${term}%`, `%${term}%`, `%${term}%`, `%${term}%`]); 
            
            return rows;
        } catch (error) {
            console.error('Error in CompanyModel.search:', error.message);
            throw error;
        }
    }

    static async updateBasic(companyId, companyData, representativeData) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            const [companyResult] = await connection.query(`
                UPDATE membership_companies 
                SET 
                    company_name = ?, 
                    company_tin = ?, 
                    business_activity = ?, 
                    company_phone = ?, 
                    company_email = ?, 
                    company_website = ?
                WHERE 
                    company_id = ?
            `, [
                companyData.company_name,
                companyData.company_tin,
                companyData.business_activity,
                companyData.company_phone,
                companyData.company_email,
                companyData.company_website,
                companyId
            ]);

            const [repResult] = await connection.query(`
                UPDATE membership_representatives 
                SET 
                    firstname = ?, 
                    lastname = ?, 
                    gender = ?, 
                    telephone = ?, 
                    email = ?, 
                    birthday = ?
                WHERE 
                    company_id = ?
            `, [
                representativeData.firstname,
                representativeData.lastname,
                representativeData.gender,
                representativeData.telephone,
                representativeData.rep_email,
                representativeData.birthday,
                companyId
            ]);

            await connection.commit();

            return companyResult.affectedRows > 0 || repResult.affectedRows > 0;
        } catch (error) {
            await connection.rollback();
            console.error('Error in CompanyModel.updateBasic:', error);
            throw error;
        } finally {
            connection.release();
        }
    }

    // --- QUITUS RELATED METHODS ---

    static async getQuitusMemberByTin(tin) {
        try {
            const [rows] = await pool.query(`
                SELECT 
                    c.company_tin AS taxpayer_tin,
                    c.company_name AS taxpayer_name,
                    c.company_phone AS taxpayer_phone,
                    c.company_email AS taxpayer_email,
                    CONCAT(r.firstname, ' ', r.lastname) AS official_representative,
                    r.telephone AS representative_phone,
                    c.membership_status,
                    c.membership_category,
                    c.created_at,
                    c.updated_at
                FROM 
                    membership_companies c
                LEFT JOIN 
                    membership_representatives r ON c.company_id = r.company_id
                WHERE 
                    c.company_tin = ? 
                    AND r.is_approved = 1
                LIMIT 1
            `, [tin]);

            return rows[0] || null;
        } catch (error) {
            console.error('Error fetching quitus member by TIN:', error.message);
            throw error;
        }
    }

    static async getAllActiveQuitusMembers() {
        try {
            const [rows] = await pool.query(`
                SELECT 
                    c.company_tin AS taxpayer_tin,
                    c.company_name AS taxpayer_name,
                    c.company_phone AS taxpayer_phone,
                    c.company_email AS taxpayer_email,
                    CONCAT(r.firstname, ' ', r.lastname) AS official_representative,
                    r.telephone AS representative_phone,
                    c.membership_status,
                    c.membership_category,
                    c.created_at,
                    c.updated_at
                FROM 
                    membership_companies c
                LEFT JOIN 
                    membership_representatives r ON c.company_id = r.company_id
                WHERE 
                    r.is_approved = 1
                ORDER BY 
                    c.company_name ASC
            `);

            return rows;
        } catch (error) {
            console.error('Error fetching all active quitus members:', error.message);
            throw error;
        }
    }

    static async verifyQuitusEligibility(tin) {
        try {
            const member = await this.getQuitusMemberByTin(tin);

            if (!member) {
                return {
                    eligible: false,
                    reason: 'Member not found or not active'
                };
            }

            const currentYear = new Date().getFullYear();
            const fiscalYear = currentYear; 

            return {
                eligible: true,
                fiscalYear: fiscalYear,
                memberDetails: member
            };
        } catch (error) {
            console.error('Error verifying quitus eligibility:', error.message);
            throw error;
        }
    }

    static async logQuitusRequest(tin, requestSource = 'RRA') {
        try {
            const [result] = await pool.query(`
                INSERT INTO quitus_request_logs 
                (company_tin, request_source, request_date) 
                VALUES (?, ?, NOW())
            `, [tin, requestSource]);

            return result.insertId;
        } catch (error) {
            console.error('Error logging quitus request:', error.message);
            return null;
        }
    }

}

module.exports = CompanyModel;