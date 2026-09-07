import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");

  if (req.method === "GET") {
    try {
      const { from, to } = req.query;

      const rows = await sql`
        SELECT
          shift_date,
          employee,
          department,
          team,
          status,
          shift_text
        FROM shifts
        WHERE shift_date >= ${from}
          AND shift_date <= ${to}
        ORDER BY shift_date, employee
      `;

      return res.status(200).json(rows);
    } catch (error) {
      return res.status(500).json({
        error: error.message
      });
    }
  }

  if (req.method === "POST") {
    try {
      const shifts = Array.isArray(req.body) ? req.body : [];

      for (const shift of shifts) {
        await sql`
          INSERT INTO shifts
            (
              shift_date,
              employee,
              department,
              team,
              status,
              shift_text
            )
          VALUES
            (
              ${shift.shift_date},
              ${shift.employee},
              ${shift.department || shift.team || ""},
              ${shift.team || ""},
              ${shift.status || "Schicht"},
              ${shift.shift_text || ""}
            )
          ON CONFLICT (shift_date, employee)
          DO UPDATE SET
            department = EXCLUDED.department,
            team = EXCLUDED.team,
            status = EXCLUDED.status,
            shift_text = EXCLUDED.shift_text
        `;
      }

      return res.status(200).json({ ok: true });
    } catch (error) {
      return res.status(500).json({
        error: error.message
      });
    }
  }

  return res.status(405).json({
    error: "Method not allowed"
  });
}
