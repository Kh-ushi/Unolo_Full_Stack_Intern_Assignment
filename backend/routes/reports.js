const express = require('express');
const pool = require('../config/database');
const { authenticateToken, requireManager } = require('../middleware/auth');

const router = express.Router();


router.get('/daily-summary', authenticateToken, requireManager, async (req, res) => {
    console.log("I am here");
    try {
        const { date, employee_id } = req.query;
        if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return res.status(400).json({
                success: false,
                message: 'Valid date (YYYY-MM-DD) is required'
            });
        }

        let query = `
      SELECT
        u.id AS employee_id,
        u.name AS employee_name,
        COUNT(c.id) AS checkins,
        COUNT(DISTINCT c.client_id) AS clients_visited,
        ROUND(
          SUM(
            (JULIANDAY(c.checkout_time) - JULIANDAY(c.checkin_time)) * 24
          ),
          2
        ) AS working_hours
      FROM users u
      LEFT JOIN checkins c
        ON u.id = c.employee_id
        AND DATE(c.checkin_time) = ?
      WHERE u.manager_id = ?
    `;

        const params = [date, req.user.id];

        if (employee_id) {
            query += ' AND u.id = ?';
            params.push(employee_id);
        }

        query += ' GROUP BY u.id';

        const [rows] = await pool.execute(query, params);

        if (rows.length === 0) {
            return res.json({
                success: true,
                data: {
                    date,
                    team_summary: {
                        total_employees: 0,
                        total_checkins: 0,
                        total_working_hours: 0,
                        total_clients_visited: 0
                    },
                    employees: []
                }
            });
        }


        const team_summary = {
            total_employees: rows.length,
            total_checkins: rows.reduce((s, r) => s + r.checkins, 0),
            total_working_hours: rows.reduce((s, r) => s + (r.working_hours || 0), 0),
            total_clients_visited: rows.reduce((s, r) => s + r.clients_visited, 0)
        };

        res.json({
            success: true,
            data: {
                date,
                team_summary,
                employees: rows.map(r => ({
                    employee_id: r.employee_id,
                    name: r.employee_name,
                    checkins: r.checkins,
                    working_hours: r.working_hours || 0,
                    clients_visited: r.clients_visited
                }))
            }
        });

    }
    catch (error) {

        console.error('Daily summary error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate daily summary'
        });

    }

});

module.exports = router;