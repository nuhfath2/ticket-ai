import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: process.env.DB_PASSWORD || 'password@123',
  database: 'ticket-ai',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;

const CREATE_TABLES = [
  `CREATE TABLE IF NOT EXISTS tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    customer_name VARCHAR(255),
    customer_email VARCHAR(255),
    status ENUM('NEW','ASSIGNED','IN_PROGRESS','RESOLVED','CLOSED') DEFAULT 'NEW',
    assigned_to VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS triage_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_id INT NOT NULL,
    category VARCHAR(50) NOT NULL,
    urgency VARCHAR(20) NOT NULL,
    confidence DECIMAL(3,2) NOT NULL,
    routing_team VARCHAR(50) NOT NULL,
    reasoning TEXT NOT NULL,
    needs_human_review BOOLEAN DEFAULT FALSE,
    model_used VARCHAR(100),
    triaged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS overrides (
    id INT AUTO_INCREMENT PRIMARY KEY,
    triage_result_id INT NOT NULL,
    original_category VARCHAR(50),
    new_category VARCHAR(50),
    original_urgency VARCHAR(20),
    new_urgency VARCHAR(20),
    reason TEXT,
    overridden_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (triage_result_id) REFERENCES triage_results(id) ON DELETE CASCADE
  )`,
];

export async function initDatabase() {
  try {
    for (const sql of CREATE_TABLES) {
      await pool.execute(sql);
    }
    console.log('  Tables created/verified');
    return true;
  } catch (err) {
    console.error('  Table creation failed:', err.message);
    return false;
  }
}

export async function testConnection() {
  try {
    const conn = await pool.getConnection();
    console.log('  MySQL connected to ticket-ai database');
    conn.release();
    return true;
  } catch (err) {
    console.error('  MySQL connection failed:', err.message);
    return false;
  }
}

export async function createTicket({ subject, body, customer_name, customer_email }) {
  const [result] = await pool.execute(
    'INSERT INTO tickets (subject, body, customer_name, customer_email) VALUES (?, ?, ?, ?)',
    [subject, body, customer_name || null, customer_email || null]
  );
  return result.insertId;
}

export async function getTicket(id) {
  const [rows] = await pool.execute(
    `SELECT t.*, tr.id as triage_id, tr.category, tr.urgency, tr.confidence,
            tr.routing_team, tr.reasoning, tr.needs_human_review, tr.model_used, tr.triaged_at
     FROM tickets t
     LEFT JOIN triage_results tr ON tr.ticket_id = t.id
     WHERE t.id = ?`,
    [id]
  );
  return rows[0] || null;
}

export async function getAllTickets({ search, status, category, urgency, page = 1, limit = 50 } = {}) {
  let where = [];
  let params = [];

  if (search) {
    where.push('(t.subject LIKE ? OR t.body LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }
  if (status) {
    where.push('t.status = ?');
    params.push(status);
  }
  if (category) {
    where.push('tr.category = ?');
    params.push(category);
  }
  if (urgency) {
    where.push('tr.urgency = ?');
    params.push(urgency);
  }

  const whereClause = where.length > 0 ? 'WHERE ' + where.join(' AND ') : '';
  const offset = (page - 1) * limit;

  const [countResult] = await pool.execute(
    `SELECT COUNT(*) as total FROM tickets t LEFT JOIN triage_results tr ON tr.ticket_id = t.id ${whereClause}`,
    params
  );
  const total = countResult[0].total;

  const [rows] = await pool.execute(
    `SELECT t.*, tr.id as triage_id, tr.category, tr.urgency, tr.confidence,
            tr.routing_team, tr.reasoning, tr.needs_human_review, tr.triaged_at
     FROM tickets t
     LEFT JOIN triage_results tr ON tr.ticket_id = t.id
     ${whereClause}
     ORDER BY t.created_at DESC
     LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`,
    params
  );

  return { tickets: rows, total, page, limit };
}

export async function saveTriageResult({ ticket_id, category, urgency, confidence, routing_team, reasoning, needs_human_review, model_used }) {
  const [result] = await pool.execute(
    `INSERT INTO triage_results (ticket_id, category, urgency, confidence, routing_team, reasoning, needs_human_review, model_used)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [ticket_id, category, urgency, confidence, routing_team, reasoning, needs_human_review ? 1 : 0, model_used || 'llama-3.3-70b-versatile']
  );
  return result.insertId;
}

export async function updateTicketStatus(id, status) {
  await pool.execute('UPDATE tickets SET status = ? WHERE id = ?', [status, id]);
}

export async function updateTicketAssignment(id, assigned_to) {
  await pool.execute('UPDATE tickets SET assigned_to = ?, status = ? WHERE id = ?', [assigned_to, 'ASSIGNED', id]);
}

export async function overrideTriage({ triage_result_id, original_category, new_category, original_urgency, new_urgency, reason, overridden_by }) {
  const [result] = await pool.execute(
    `INSERT INTO overrides (triage_result_id, original_category, new_category, original_urgency, new_urgency, reason, overridden_by)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [triage_result_id, original_category, new_category, original_urgency, new_urgency, reason, overridden_by]
  );

  await pool.execute(
    'UPDATE triage_results SET category = ?, urgency = ? WHERE id = ?',
    [new_category, new_urgency, triage_result_id]
  );

  return result.insertId;
}

export async function getStats() {
  const [totalResult] = await pool.execute('SELECT COUNT(*) as total FROM tickets');
  const total = totalResult[0].total;

  const [urgentResult] = await pool.execute(
    "SELECT COUNT(*) as urgent FROM triage_results WHERE urgency IN ('critical', 'high')"
  );
  const urgent = urgentResult[0].urgent;

  const [humanResult] = await pool.execute(
    'SELECT COUNT(*) as needs_review FROM triage_results WHERE needs_human_review = 1'
  );
  const needsHuman = humanResult[0].needs_review;

  const [avgResult] = await pool.execute(
    'SELECT AVG(confidence) as avg_confidence FROM triage_results'
  );
  const avgConfidence = avgResult[0].avg_confidence || 0;

  const [categories] = await pool.execute(
    'SELECT category, COUNT(*) as count FROM triage_results GROUP BY category ORDER BY count DESC'
  );

  const [urgencies] = await pool.execute(
    "SELECT urgency, COUNT(*) as count FROM triage_results GROUP BY urgency ORDER BY FIELD(urgency, 'critical', 'high', 'medium', 'low')"
  );

  const [statusCounts] = await pool.execute(
    'SELECT status, COUNT(*) as count FROM tickets GROUP BY status'
  );

  const [overrides] = await pool.execute('SELECT COUNT(*) as count FROM overrides');
  const totalOverrides = overrides[0].count;

  return { total, urgent, needsHuman, avgConfidence, categories, urgencies, statusCounts, totalOverrides };
}
