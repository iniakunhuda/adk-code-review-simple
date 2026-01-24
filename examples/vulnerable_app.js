// VULNERABLE EXPRESS APP - For Code Review Testing
// This code contains MULTIPLE security vulnerabilities

const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const app = express();
app.use(express.json());

// 🚨 HARDCODED SECRETS
const DB_CONFIG = {
	host: 'production-db.example.com',
	port: 5432,
	user: 'admin',
	password: 'Sup3rS3cr3tP@ssw0rd!2024', // 🚨 HARDCODED
	database: 'production_db'
};

const JWT_SECRET = 'my-secret-jwt-key-not-random-at-all'; // 🚨 WEAK SECRET

// Database connection (using raw queries - no ORM)
const { Pool } = require('pg');
const pool = new Pool(DB_CONFIG);

// 🚨 SQL INJECTION - Login endpoint
app.post('/api/login', async (req, res) => {
	const { username, password } = req.body;

	// 🚨 SQL INJECTION - Direct string interpolation
	const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;

	try {
		const result = await pool.query(query);

		if (result.rows.length > 0) {
			// 🚨 WEAK JWT - No expiration
			const token = Buffer.from(JSON.stringify({ user: result.rows[0] })).toString('base64');
			res.json({ token, user: result.rows[0] }); // 🚨 SENSITIVE DATA EXPOSURE
		} else {
			res.status(401).json({ error: 'Invalid credentials' });
		}
	} catch (err) {
		// 🚨 INFORMATION LEAKAGE - Exposing database errors
		res.status(500).json({ error: 'Database error: ' + err.message });
	}
});

// 🚨 STORED XSS - User profile update
app.post('/api/profile', (req, res) => {
	const { username, bio } = req.body;

	// 🚨 No input sanitization
	const query = `UPDATE users SET bio = '${bio}' WHERE username = '${username}'`;

	pool.query(query, (err, result) => {
		if (err) {
			res.status(500).json({ error: err.message });
		} else {
			res.json({ success: true, message: 'Profile updated' });
		}
	});
});

// 🚨 COMMAND INJECTION - System ping
app.get('/api/ping', (req, res) => {
	const ip = req.query.ip;

	// 🚨 COMMAND INJECTION - Direct command execution
	exec(`ping -c 4 ${ip}`, (error, stdout, stderr) => {
		if (error) {
			res.status(500).json({ error: error.message });
		} else {
			res.json({ output: stdout });
		}
	});
});

// 🚨 PATH TRAVERSAL - File download
app.get('/api/download', (req, res) => {
	const filename = req.query.file;

	// 🚨 PATH TRAVERSAL - No path validation
	const filepath = path.join(__dirname, 'uploads', filename);

	res.download(filepath);
});

// 🚨 SSRF - Fetch external URL
app.get('/api/fetch', async (req, res) => {
	const url = req.query.url;

	// 🚨 SSRF - No URL validation
	try {
		const response = await axios.get(url);
		res.json({ data: response.data });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// 🚨 INSECURE DESERIALIZATION
app.post('/api/config', (req, res) => {
	const config = req.body;

	// 🚨 Eval-like behavior with user input
	if (config.callback) {
		// 🚨 REMOTE CODE EXECUTION
		const result = eval(config.callback);
		res.json({ result });
	} else {
		res.json({ message: 'Config updated' });
	}
});

// 🚨 NO RATE LIMITING - Brute force vulnerable
app.post('/api/reset-password', async (req, res) => {
	const { email } = req.body;

	// 🚨 EMAIL ENUMERATION - Different responses
	const query = `SELECT * FROM users WHERE email = '${email}'`;
	const result = await pool.query(query);

	if (result.rows.length > 0) {
		// 🚨 SENDING RESET TOKEN via email (simulated)
		const resetToken = Math.random().toString(36).substring(2); // 🚨 WEAK TOKEN

		// 🚨 LOGGING SENSITIVE DATA
		console.log(`Reset token for ${email}: ${resetToken}`);

		res.json({ message: 'Reset link sent to your email' });
	} else {
		res.status(404).json({ error: 'Email not found' }); // 🚨 EMAIL ENUMERATION
	}
});

// 🚨 MISSING AUTHENTICATION - Admin endpoint
app.get('/api/admin/users', async (req, res) => {
	// 🚨 NO AUTH CHECK!

	const query = 'SELECT * FROM users'; // 🚨 Returning all users including passwords
	const result = await pool.query(query);

	res.json({ users: result.rows });
});

// 🚨 INSECURE DIRECT OBJECT REFERENCE (IDOR)
app.get('/api/invoices/:id', async (req, res) => {
	const invoiceId = req.params.id;
	const userId = req.headers['x-user-id']; // 🚨 Weak auth header

	// 🚨 IDOR - No ownership check
	const query = `SELECT * FROM invoices WHERE id = ${invoiceId}`;
	const result = await pool.query(query);

	res.json({ invoice: result.rows[0] });
});

// 🚨 CORS MISCONFIGURATION
app.use((req, res, next) => {
	// 🚨 Overly permissive CORS
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
	res.header('Access-Control-Allow-Headers', '*');
	next();
});

// 🚨 DEBUG MODE IN PRODUCTION
app.use((err, req, res, next) => {
	// 🚨 STACK TRACE EXPOSURE
	console.error(err.stack);
	res.status(500).json({
		error: err.message,
		stack: err.stack, // 🚨 Exposing stack trace
		url: req.url // 🚨 Exposing request details
	});
});

// 🚨 SENSITIVE DATA LOGGING
app.post('/api/payment', (req, res) => {
	const { cardNumber, cvv, expiry, amount } = req.body;

	// 🚨 LOGGING CREDIT CARD DATA
	console.log(`Processing payment: ${cardNumber} CVV: ${cvv} Exp: ${expiry} Amount: ${amount}`);

	// Process payment...
	res.json({ success: true, message: 'Payment processed' });
});

// 🚨 WEAK PASSWORD POLICY
app.post('/api/register', async (req, res) => {
	const { username, password, email } = req.body;

	// 🚨 NO PASSWORD VALIDATION
	// 🚨 NO PASSWORD HASHING - Storing plaintext
	const query = `INSERT INTO users (username, password, email) VALUES ('${username}', '${password}', '${email}')`;

	try {
		await pool.query(query);
		res.json({ success: true, message: 'User registered' });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// 🚨 RUNNING ON HTTP (not HTTPS)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`🚨 Vulnerable server running on HTTP at port ${PORT}`);
	console.log(`🔓 Database: ${DB_CONFIG.host} - User: ${DB_CONFIG.user}`);
});
