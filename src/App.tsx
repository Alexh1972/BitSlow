import "./index.css";
import {useEffect, useState} from "react";
import {hashPassword} from "@/Util";

// Define the Transaction interface based on the API response
interface Transaction {
	id: number;
	coin_id: number;
	amount: number;
	transaction_date: string;
	seller_id: number | null;
	seller_name: string | null;
	buyer_id: number;
	buyer_name: string;
	bit1: number;
	bit2: number;
	bit3: number;
	value: number;
	computedBitSlow: string;
}

const ENDPOINT_URL = "http://localhost:3000/"; // NOTE: change this based on your environment.

function fetchTransactions(): Promise<Transaction[]> {
	return fetch(ENDPOINT_URL + "api/transactions")
		.then((response) => response.json())
		.catch((error) => console.error("Error fetching data:", error));
}

function useTransactions() {
	const [transactions, setTransactions] = useState<Transaction[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	useEffect(() => {
		fetchTransactions()
			.then((data) => {
				setTransactions(data);
				setLoading(false);
			})
			.catch((err) => {
				setError(err);
				setLoading(false);
			});
	}, []);

	return { transactions, loading, error };
}

export function App() {
	const { transactions, loading, error } = useTransactions();
	const [loadingTime, setLoadingTime] = useState(0);
	const [isSignupOpen, setIsSignupOpen] = useState(false);
	const [isLoginOpen, setIsLoginOpen] = useState(false);

	useEffect(() => {
		let timerId: number | undefined;

		if (loading) {
			timerId = window.setInterval(() => {
				setLoadingTime((prevTime) => prevTime + 1);
			}, 1000);
		}

		return () => {
			if (timerId) clearInterval(timerId);
		};
	}, [loading]);

	if (loading) {
		return (
			<div className="flex flex-col justify-center items-center h-screen bg-gray-50">
				<div className="w-16 h-16 mb-4 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin"></div>
				<div className="animate-pulse flex flex-col items-center">
					<h2 className="text-xl font-semibold text-gray-700 mb-2">
						Loading Transactions
					</h2>
					<p className="text-sm text-gray-600 mb-2">
						Time elapsed: {loadingTime} seconds
					</p>
					<div className="flex space-x-1">
						<div
							className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
							style={{ animationDelay: "0ms" }}
						></div>
						<div
							className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
							style={{ animationDelay: "150ms" }}
						></div>
						<div
							className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
							style={{ animationDelay: "300ms" }}
						></div>
					</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="text-red-500 p-4 text-center">
				Error loading transactions: {error.message}
			</div>
		);
	}

	return (
		<div className="max-w-7xl mx-auto p-4">
			<div>
				<button className="login-btn" onClick={() => setIsLoginOpen(true)}>
					Login
				</button>

				<div className={`login-panel ${isLoginOpen ? "active" : ""}`}>
					<button className="login-close-btn" onClick={() => setIsLoginOpen(false)}>
						X
					</button>
					<h1 className="text-center"><b>Login</b></h1>
					<div className="login-form-group">
						<label htmlFor="login-email">Email:</label>
						<input
							type="email"
							id="login-email"
							required
						/>
					</div>
					<div className="login-form-group">
						<label htmlFor="login-password">Password:</label>
						<input
							type="password"
							id="login-password"
							required
						/>
					</div>
					<h2 id="error-login" className="text-red-700"></h2>
					<button type="submit" className="submit-btn font-bold mb-8" onClick={
						async () => {
							document.getElementById("login-loading").style.display = "block";
							const hashedPassword = await hashPassword((document.getElementById("login-password") as HTMLInputElement)?.value);
							const response = await fetch("/api/login", {
								method: "POST",
								headers: {
									"Content-Type": "application/json",
								},
								body: JSON.stringify({
									email: (document.getElementById("login-email") as HTMLInputElement)?.value,
									password: hashedPassword,
								}),
							});

							const json = await response.json();
							if (json.data.status == 0) {
								document.getElementById("login-loading").innerHTML = json.data.error;
							} else {

							}
							document.getElementById("login-loading").style.display = "none";
						}
					}>
						Submit
					</button>
					<div className="w-7 h-7 mb-4 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin" id="login-loading" style={{ display: "none" }}></div>
				</div>

				<div className={`panel ${isSignupOpen ? "active" : ""}`}>
					<button
						className="close-btn"
						onClick={() => setIsSignupOpen(false)}
					>
						X
					</button>
					<h1 className="text-center"><b>Signup</b></h1>
						<div className="form-group">
							<label htmlFor="name">Name:</label>
							<input type="text" id="name" required />
						</div>
						<div className="form-group">
							<label htmlFor="email">Email:</label>
							<input type="email" id="email" required />
						</div>
						<div className="form-group">
							<label htmlFor="password">Password:</label>
							<input type="password" id="password" required />
						</div>
						<div className="form-group">
							<label htmlFor="phone">Phone:</label>
							<input type="tel" id="phone" required />
						</div>
						<div className="form-group">
							<label htmlFor="address">Address:</label>
							<input type="text" id="address" required />
						</div>
						<h2 id="error-signup" className="text-red-700"></h2>
						<button onClick={
							async () => {
								document.getElementById("signup-loading").style.display = "block";
								const hashedPassword = await hashPassword((document.getElementById("password") as HTMLInputElement)?.value);
								const response = await fetch("/api/signup", {
									method: "POST",
									headers: {
										"Content-Type": "application/json",
									},
									body: JSON.stringify({
										name: (document.getElementById("name") as HTMLInputElement)?.value,
										email: (document.getElementById("email") as HTMLInputElement)?.value,
										phone: (document.getElementById("phone") as HTMLInputElement)?.value,
										address: (document.getElementById("address") as HTMLInputElement)?.value,
										password: hashedPassword,
									}),
								});

								const json = await response.json();
								console.log(json.data.status);
								if (json.data.status == 0) {
									document.getElementById("error-signup").innerHTML = json.data.error;
								} else {
									window.location.reload();
								}

								document.getElementById("signup-loading").style.display = "none";
							}
						} type="submit" className="submit-btn font-bold mb-8">Submit</button>
					<div className="w-7 h-7 mb-4 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin" id="signup-loading" style={{ display: "none" }}></div>

				</div>

				<style>{`
                body {
                    font-family: Arial, sans-serif;
                }
                .login-btn {
                    position: fixed;
                    top: 20px;
                    right: 100px;
                    padding: 10px 15px;
                    background: darkblue;
                    color: white;
                    border: none;
                    cursor: pointer;
                    font-weight: bold;
                }
                .login-panel {
                    position: fixed;
                    right: -300px;
                    top: 0;
                    width: 300px;
                    height: 100%;
                    background: #e8f0fe;
                    box-shadow: -2px 0 5px rgba(0,0,0,0.2);
                    transition: right 0.3s ease-in-out;
                    padding: 20px;
                }
                .login-panel.active {
                    right: 0;
                }
                .login-close-btn {
                    cursor: pointer;
                    background: darkred;
                    color: white;
                    border: none;
                    padding: 5px 10px;
                    float: right;
                }
                .login-form-group {
                    margin-bottom: 10px;
                }
                .login-form-group label {
                    display: block;
                }
                .login-form-group input {
                    width: 100%;
                    padding: 5px;
                }
                .login-submit-btn {
                    padding: 10px;
                    background: darkgreen;
                    color: white;
                    border: none;
                    cursor: pointer;
                }
                input {
				  width: 100%;
				  padding: 12px 20px;
				  margin: 8px 0;
				  box-sizing: border-box;
				  border: 3px solid #ccc;
				  -webkit-transition: 0.5s;
				  transition: 0.5s;
				  outline: none;
				}
				input:focus {
				  border: 3px solid #555;
				}
                .panel {
                    position: fixed;
                    right: -300px;
                    top: 0;
                    width: 300px;
                    height: 100%;
                    background: #e8f0fe;
                    box-shadow: -2px 0 5px rgba(0,0,0,0.2);
                    transition: right 0.3s ease-in-out;
                    padding: 20px;
                }
                .panel.active {
                    right: 0;
                }
                .close-btn {
                    cursor: pointer;
                    background: red;
                    color: white;
                    border: none;
                    padding: 5px 10px;
                    float: right;
                }
                .form-group {
                    margin-bottom: 10px;
                }
                .form-group label {
                    display: block;
                }
                .form-group input {
                    width: 100%;
                    padding: 5px;
                }
                .signup-btn {
                    padding: 10px;
                    background: darkblue;
                    color: white;
                    border: none;
                    cursor: pointer;
                }
                .submit-btn {
                    padding: 10px;
                    background: blue;
                    color: white;
                    border: none;
                    cursor: pointer;
                }
            `}</style>
			</div>

			<button
				className="signup-btn font-bold mb-8"
				onClick={() => setIsSignupOpen(true)}
			>
				Signup
			</button>

			<h1 className="text-3xl font-bold mb-8 text-gray-800">
				BitSlow Transactions
			</h1>

			{transactions.length === 0 ? (
				<p className="text-gray-500">No transactions found</p>
			) : (
				<div className="overflow-x-auto rounded-lg shadow-md">
					<table className="w-full border-collapse bg-white">
						<thead>
							<tr className="bg-gray-800 text-white">
								<th className="p-4 text-left">ID</th>
								<th className="p-4 text-left">BitSlow</th>
								<th className="p-4 text-left">Seller</th>
								<th className="p-4 text-left">Buyer</th>
								<th className="p-4 text-right">Amount</th>
								<th className="p-4 text-left">Date</th>
							</tr>
						</thead>
						<tbody>
							{transactions.map((transaction, index) => (
								<tr
									key={transaction.id}
									className={`hover:bg-gray-50 transition-colors ${index === transactions.length - 1 ? "" : "border-b border-gray-200"}`}
								>
									<td className="p-4 text-gray-600">{transaction.id}</td>
									<td className="p-4">
										<div>
											<div className="font-medium text-gray-800">
												{transaction.computedBitSlow}
											</div>
											<div className="text-xs text-gray-500 mt-1">
												Bits: {transaction.bit1}, {transaction.bit2},{" "}
												{transaction.bit3}
											</div>
											<div className="text-xs text-gray-500">
												Value: ${transaction.value.toLocaleString()}
											</div>
										</div>
									</td>
									<td className="p-4 text-gray-700">
										{transaction.seller_name
											? transaction.seller_name
											: "Original Issuer"}
									</td>
									<td className="p-4 text-gray-700">
										{transaction.buyer_name}
									</td>
									<td className="p-4 text-right font-semibold text-gray-800">
										${transaction.amount.toLocaleString()}
									</td>
									<td className="p-4 text-sm text-gray-600">
										{new Date(transaction.transaction_date).toLocaleString()}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}

function getCookie(name: string): string | null {
	const cookies = document.cookie.split('; ');
	for (const cookie of cookies) {
		const [cookieName, cookieValue] = cookie.split('=');
		if (cookieName === name) {
			return decodeURIComponent(cookieValue);
		}
	}
	return null;
}

function setCookie(name: string, value: string, days: number = 7, path: string = '/'): void {
	const expires = new Date();
	expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
	document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires.toUTCString()}; path=${path}`;
}

function deleteCookie(name: string, path: string = '/'): void {
	document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}`;
}

export default App;
