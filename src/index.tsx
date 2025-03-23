import { serve } from "bun";
import { Database } from "bun:sqlite";
import { seedDatabase } from "./seed";
import index from "./index.html";
import { computeBitSlow } from "./bitslow";

// Initialize the database
const db = new Database(":memory:");

// Seed the database with random data
seedDatabase(db, {
	clientCount: 30,
	bitSlowCount: 20,
	transactionCount: 50,
	clearExisting: true,
});
const server = serve({
	routes: {
		"/*": index,
		"/api/transactions": () => {
			try {
				const transactions = db
					.query(`
						SELECT t.id,
							   t.coin_id,
							   t.amount,
							   t.transaction_date,
							   seller.id   as seller_id,
							   seller.name as seller_name,
							   buyer.id    as buyer_id,
							   buyer.name  as buyer_name,
							   c.bit1,
							   c.bit2,
							   c.bit3,
							   c.value
						FROM transactions t
								 LEFT JOIN clients seller ON t.seller_id = seller.id
								 JOIN clients buyer ON t.buyer_id = buyer.id
								 JOIN coins c ON t.coin_id = c.coin_id
						ORDER BY t.transaction_date DESC
					`)
					.all();

				const enhancedTransactions = transactions.map((transaction) => ({
					...transaction,
					computedBitSlow: computeBitSlow(
						transaction.bit1,
						transaction.bit2,
						transaction.bit3,
					),
				}));

				return Response.json(enhancedTransactions);
			} catch (error) {
				console.error("Error fetching transactions:", error);
				return new Response("Error fetching transactions", {status: 500});
			}
		},
	},
	fetch: async (req) => {
		const url = new URL(req.url);
		const pathname = url.pathname;
		const method = req.method;

		if (pathname === "/api/signup" && method === "POST") {
			try {
				const requestBody = await req.json();
				const insertUser = db.prepare(`
					INSERT INTO users (client_id, password)
					VALUES (?, ?)
				`)
				const insertClient = db.prepare(`
					INSERT INTO clients (name, email, phone, address) 
					VALUES (?, ?, ?, ?)
				`);
				const getClientByEmail = db.prepare(`
					SELECT * FROM clients WHERE email = ?;
				`);

				const client = getClientByEmail.get(requestBody['email']);

				if (!client) {
					const result = insertClient.run(requestBody['name'], requestBody['email'], requestBody['phone'], requestBody['address']);
					const newId = result.lastInsertRowid;
					insertUser.run(newId, requestBody['password'])
				} else {
					return Response.json({message: "Signup failed", data: {"status": 0, "error" : "Email is already in use!"} }, { status: 200 })
				}
				return Response.json({message: "Signup successful", data: {"status": 1} }, { status: 200 });
			} catch (error) {
				console.error("Error signup:", error);
				return new Response("Invalid request body", { status: 400 });
			}
		} else if (pathname === "/api/login" && method === "POST") {
			const requestBody = await req.json();
			const clientQuery = db.prepare(`
				SELECT * FROM clients WHERE email = ?;
			`);

			const client = clientQuery.get(requestBody['email']);
			if (client != null) {
				const userQuery = db.prepare(`
					SELECT * FROM users WHERE client_id = ?;
				`)
				const user = userQuery.get(client['id']);
				console.log(user['password'], requestBody['password']);
				if (requestBody['password'] != null && user != null && user['password'] != null) {
					if (requestBody['password'] == user['password']) {
						return Response.json({message: "Login successful", data: {"status": 1} }, { status: 200 });
					}
				}
			}
			return Response.json({message: "Login failed", data: {"status": 0, "error": "Email or password might not be correct!"} }, { status: 200 });
		}

		return new Response("Not Found", { status: 404 });
	},
	development: process.env.NODE_ENV !== "production",
});

console.log(`🚀 Server running at ${server.url}`);
