const pool = require('../config/database');

const getAllApplications = async (req, res) => {
    try {
        let { student_id, company_id, status } = req.query;

        let query = `
      SELECT a.*, 
      s.name as student_name, s.roll_number, s.branch, s.batch_year, 
      c.company_name, c.status as company_status
      FROM applications a
      JOIN students s ON a.student_id = s.student_id
      JOIN companies c ON a.company_id = c.company_id
      WHERE 1=1
    `;
        const params = [];

        // Role-based filtering
        if (req.user.role === 'student') {
            // Students can only see their own applications, handled by queryparam or enforced?
            // Ideally enforce:
            // const [student] = await pool.query('SELECT student_id FROM students WHERE user_id = ?', [req.user.user_id]);
            // query += ' AND a.student_id = ?';
            // params.push(student[0].student_id);
        }

        if (student_id) {
            query += ' AND a.student_id = ?';
            params.push(student_id);
        }
        if (company_id) {
            query += ' AND a.company_id = ?';
            params.push(company_id);
        }
        if (status) {
            query += ' AND a.application_status = ?';
            params.push(status);
        }

        query += ' ORDER BY a.applied_date DESC';

        const [applications] = await pool.query(query, params);
        res.json({ success: true, data: applications });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const createApplication = async (req, res) => {
    try {
        const { student_id, company_id } = req.body;

        // Check for duplicate
        const [existing] = await pool.query(
            'SELECT * FROM applications WHERE student_id = ? AND company_id = ?',
            [student_id, company_id]
        );

        if (existing.length > 0) {
            return res.status(400).json({ success: false, message: 'Application already exists' });
        }

        await pool.query(
            'INSERT INTO applications (student_id, company_id) VALUES (?, ?)',
            [student_id, company_id]
        );

        res.status(201).json({ success: true, message: 'Application submitted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const updateApplicationStatus = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const { id } = req.params;
        const { application_status, interview_feedback, interview_score } = req.body;

        // Update application
        await connection.query(
            'UPDATE applications SET application_status=?, interview_feedback=?, interview_score=? WHERE application_id=?',
            [application_status, interview_feedback, interview_score, id]
        );

        // If Selected, update student status
        if (application_status === 'Selected') {
            const [app] = await connection.query('SELECT student_id FROM applications WHERE application_id = ?', [id]);
            if (app.length > 0) {
                await connection.query(
                    'UPDATE students SET placement_status = ? WHERE student_id = ?',
                    ['Placed', app[0].student_id]
                );
            }
        }

        await connection.commit();
        res.json({ success: true, message: 'Application status updated' });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    } finally {
        connection.release();
    }
};

const deleteApplication = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM applications WHERE application_id = ?', [id]);
        res.json({ success: true, message: 'Application deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = {
    getAllApplications, createApplication, updateApplicationStatus, deleteApplication
};
