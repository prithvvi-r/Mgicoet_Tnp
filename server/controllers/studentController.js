const pool = require('../config/database');

const getAllStudents = async (req, res) => {
    try {
        let { branch, batch_year, placement_status, search, sort_by, order } = req.query;

        let query = 'SELECT * FROM students WHERE 1=1';
        const params = [];

        if (branch) {
            query += ' AND branch = ?';
            params.push(branch);
        }
        if (batch_year) {
            query += ' AND batch_year = ?';
            params.push(batch_year);
        }
        if (placement_status) {
            query += ' AND placement_status = ?';
            params.push(placement_status);
        }
        if (search) {
            query += ' AND (name LIKE ? OR roll_number LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        if (sort_by) {
            const allowedSort = ['name', 'cgpa', 'roll_number'];
            const sortField = allowedSort.includes(sort_by) ? sort_by : 'name';
            const sortOrder = order === 'desc' ? 'DESC' : 'ASC';
            query += ` ORDER BY ${sortField} ${sortOrder}`;
        } else {
            query += ' ORDER BY roll_number ASC';
        }

        const [students] = await pool.query(query, params);
        res.json({ success: true, data: students });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const getStudentById = async (req, res) => {
    try {
        const { id } = req.params;

        const [students] = await pool.query('SELECT * FROM students WHERE student_id = ?', [id]);
        if (students.length === 0) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }
        const student = students[0];

        const [applications] = await pool.query(`
      SELECT a.*, c.company_name, c.status as company_status 
      FROM applications a 
      JOIN companies c ON a.company_id = c.company_id 
      WHERE a.student_id = ?
      ORDER BY a.applied_date DESC
    `, [id]);

        res.json({ success: true, data: { ...student, applications } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const createStudent = async (req, res) => {
    try {
        const {
            roll_number, name, email, phone, branch, batch_year,
            cgpa, has_backlogs, backlog_count, skills
        } = req.body;

        // Check if user exists (optional, if linking to existing user)
        // For now, assuming standalone student creation or handled by frontend

        await pool.query(
            `INSERT INTO students 
      (roll_number, name, email, phone, branch, batch_year, cgpa, has_backlogs, backlog_count, skills) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [roll_number, name, email, phone, branch, batch_year, cgpa, has_backlogs, backlog_count, skills]
        );

        res.status(201).json({ success: true, message: 'Student created successfully' });
    } catch (error) {
        console.error(error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: 'Student with this roll number or email already exists' });
        }
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const updateStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            name, phone, branch, batch_year, cgpa,
            has_backlogs, backlog_count, skills, placement_status
        } = req.body;

        // TODO: Add check to ensure students can only edit their own profile unless admin

        await pool.query(
            `UPDATE students SET 
      name=?, phone=?, branch=?, batch_year=?, cgpa=?, 
      has_backlogs=?, backlog_count=?, skills=?, placement_status=?
      WHERE student_id=?`,
            [name, phone, branch, batch_year, cgpa, has_backlogs, backlog_count, skills, placement_status, id]
        );

        res.json({ success: true, message: 'Student updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const deleteStudent = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM students WHERE student_id = ?', [id]);
        res.json({ success: true, message: 'Student deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const checkEligibility = async (req, res) => {
    try {
        const { student_id, company_id } = req.body;

        const [students] = await pool.query('SELECT * FROM students WHERE student_id = ?', [student_id]);
        const [requirements] = await pool.query('SELECT * FROM company_requirements WHERE company_id = ?', [company_id]);

        if (students.length === 0 || requirements.length === 0) {
            return res.status(404).json({ success: false, message: 'Student or Company not found' });
        }

        const student = students[0];
        const reqs = requirements[0];
        const reasons = [];
        let isEligible = true;

        // Check implementation matches rules
        if (student.cgpa < reqs.cgpa_cutoff) {
            isEligible = false;
            reasons.push(`CGPA ${student.cgpa} is below cutoff ${reqs.cgpa_cutoff}`);
        }

        if (!reqs.backlogs_allowed && student.has_backlogs) {
            isEligible = false;
            reasons.push('Company does not allow active backlogs');
        }

        if (reqs.backlogs_allowed && student.backlog_count > reqs.max_backlogs) {
            isEligible = false;
            reasons.push(`Backlogs ${student.backlog_count} exceed maximum ${reqs.max_backlogs}`);
        }

        if (reqs.branches_allowed) {
            const allowedBranches = reqs.branches_allowed.split(',').map(b => b.trim());
            if (!allowedBranches.includes(student.branch)) {
                isEligible = false;
                reasons.push(`Branch ${student.branch} is not eligible`);
            }
        }

        if (student.placement_status === 'Placed') {
            // Logic for "Dream" companies could be added here
            isEligible = false;
            reasons.push('Student is already placed');
        }

        res.json({ success: true, isEligible, reasons });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = {
    getAllStudents, getStudentById, createStudent, updateStudent,
    deleteStudent, checkEligibility
};
