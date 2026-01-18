const pool = require('../config/database');

const getAllCompanies = async (req, res) => {
    try {
        let { status, industry, city, state, job_type, branch, search, sort_by, order } = req.query;

        let query = `
      SELECT c.*, 
      (SELECT remark_text FROM company_remarks WHERE company_id = c.company_id ORDER BY created_at DESC LIMIT 1) as latest_remark
      FROM companies c
      LEFT JOIN company_requirements cr ON c.company_id = cr.company_id
      WHERE 1=1
    `;

        const params = [];

        if (status) {
            query += ' AND c.status = ?';
            params.push(status);
        }
        if (industry) {
            query += ' AND c.industry LIKE ?';
            params.push(`%${industry}%`);
        }
        if (city) {
            query += ' AND c.city LIKE ?';
            params.push(`%${city}%`);
        }
        if (state) {
            query += ' AND c.state LIKE ?';
            params.push(`%${state}%`);
        }
        if (job_type) {
            query += ' AND cr.job_type = ?';
            params.push(job_type);
        }
        if (branch) {
            query += ' AND FIND_IN_SET(?, cr.branches_allowed)';
            params.push(branch);
        }
        if (search) {
            query += ' AND (c.company_name LIKE ? OR c.industry LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        query += ' GROUP BY c.company_id'; // Avoid duplicates from joins if any

        if (sort_by) {
            const allowedSort = ['company_name', 'created_at', 'status'];
            const sortField = allowedSort.includes(sort_by) ? sort_by : 'created_at';
            const sortOrder = order === 'asc' ? 'ASC' : 'DESC';
            query += ` ORDER BY c.${sortField} ${sortOrder}`;
        } else {
            query += ' ORDER BY c.created_at DESC';
        }

        const [companies] = await pool.query(query, params);
        res.json({ success: true, data: companies });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const getCompanyById = async (req, res) => {
    try {
        const { id } = req.params;

        const [companies] = await pool.query('SELECT * FROM companies WHERE company_id = ?', [id]);
        if (companies.length === 0) {
            return res.status(404).json({ success: false, message: 'Company not found' });
        }
        const company = companies[0];

        const [contacts] = await pool.query('SELECT * FROM company_hr_contacts WHERE company_id = ?', [id]);
        const [requirements] = await pool.query('SELECT * FROM company_requirements WHERE company_id = ?', [id]);
        const [remarks] = await pool.query(`
      SELECT r.*, u.username 
      FROM company_remarks r 
      JOIN users u ON r.user_id = u.user_id 
      WHERE r.company_id = ? 
      ORDER BY r.created_at DESC
    `, [id]);
        const [history] = await pool.query('SELECT * FROM company_placement_history WHERE company_id = ? ORDER BY year DESC', [id]);

        res.json({
            success: true,
            data: { ...company, contacts, requirements: requirements[0], remarks, placement_history: history }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const createCompany = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const {
            company_name, industry, city, state, company_size, website,
            contacts, requirements
        } = req.body;

        // Insert company
        const [result] = await connection.query(
            'INSERT INTO companies (company_name, industry, city, state, company_size, website) VALUES (?, ?, ?, ?, ?, ?)',
            [company_name, industry, city, state, company_size, website]
        );
        const company_id = result.insertId;

        // Insert contacts
        if (contacts && contacts.length > 0) {
            for (const contact of contacts) {
                await connection.query(
                    'INSERT INTO company_hr_contacts (company_id, hr_name, hr_email, hr_phone, hr_designation, is_primary) VALUES (?, ?, ?, ?, ?, ?)',
                    [company_id, contact.hr_name, contact.hr_email, contact.hr_phone, contact.hr_designation, contact.is_primary]
                );
            }
        }

        // Insert requirements
        if (requirements) {
            const { branches_allowed, cgpa_cutoff, backlogs_allowed, max_backlogs, required_skills, job_type, ctc_min, ctc_max, stipend } = requirements;
            await connection.query(
                `INSERT INTO company_requirements 
        (company_id, branches_allowed, cgpa_cutoff, backlogs_allowed, max_backlogs, required_skills, job_type, ctc_min, ctc_max, stipend) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [company_id, branches_allowed, cgpa_cutoff, backlogs_allowed, max_backlogs, required_skills, job_type, ctc_min, ctc_max, stipend]
            );
        }

        await connection.commit();
        res.status(201).json({ success: true, message: 'Company created successfully', data: { company_id } });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    } finally {
        connection.release();
    }
};

const updateCompany = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const { id } = req.params;
        const {
            company_name, industry, city, state, company_size, website,
            contacts, requirements
        } = req.body;

        // Update company
        await connection.query(
            'UPDATE companies SET company_name=?, industry=?, city=?, state=?, company_size=?, website=? WHERE company_id=?',
            [company_name, industry, city, state, company_size, website, id]
        );

        // Update contacts (replace all)
        if (contacts) {
            await connection.query('DELETE FROM company_hr_contacts WHERE company_id = ?', [id]);
            for (const contact of contacts) {
                await connection.query(
                    'INSERT INTO company_hr_contacts (company_id, hr_name, hr_email, hr_phone, hr_designation, is_primary) VALUES (?, ?, ?, ?, ?, ?)',
                    [id, contact.hr_name, contact.hr_email, contact.hr_phone, contact.hr_designation, contact.is_primary]
                );
            }
        }

        // Update requirements (upsert)
        if (requirements) {
            await connection.query('DELETE FROM company_requirements WHERE company_id = ?', [id]);
            const { branches_allowed, cgpa_cutoff, backlogs_allowed, max_backlogs, required_skills, job_type, ctc_min, ctc_max, stipend } = requirements;
            await connection.query(
                `INSERT INTO company_requirements 
        (company_id, branches_allowed, cgpa_cutoff, backlogs_allowed, max_backlogs, required_skills, job_type, ctc_min, ctc_max, stipend) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [id, branches_allowed, cgpa_cutoff, backlogs_allowed, max_backlogs, required_skills, job_type, ctc_min, ctc_max, stipend]
            );
        }

        await connection.commit();
        res.json({ success: true, message: 'Company updated successfully' });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    } finally {
        connection.release();
    }
};

const updateCompanyStatus = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const { id } = req.params;
        const { status, reason } = req.body;
        const user_id = req.user.user_id;

        // Get old status
        const [rows] = await connection.query('SELECT status FROM companies WHERE company_id = ?', [id]);
        if (rows.length === 0) return res.status(404).json({ success: false, message: 'Company not found' });
        const old_status = rows[0].status;

        // Update status
        await connection.query('UPDATE companies SET status = ? WHERE company_id = ?', [status, id]);

        // Log history
        await connection.query(
            'INSERT INTO company_status_history (company_id, user_id, old_status, new_status, reason) VALUES (?, ?, ?, ?, ?)',
            [id, user_id, old_status, status, reason]
        );

        await connection.commit();
        res.json({ success: true, message: 'Status updated successfully' });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    } finally {
        connection.release();
    }
};

const addRemark = async (req, res) => {
    try {
        const { id } = req.params;
        const { remark_text } = req.body;
        const user_id = req.user.user_id;

        await pool.query(
            'INSERT INTO company_remarks (company_id, user_id, remark_text) VALUES (?, ?, ?)',
            [id, user_id, remark_text]
        );

        res.status(201).json({ success: true, message: 'Remark added' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const deleteCompany = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM companies WHERE company_id = ?', [id]);
        res.json({ success: true, message: 'Company deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = {
    getAllCompanies, getCompanyById, createCompany, updateCompany,
    updateCompanyStatus, addRemark, deleteCompany
};
