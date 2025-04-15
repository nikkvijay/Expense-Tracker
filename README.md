# Smart Expense Organizer 🧾💸

Smart Expense Organizer is a full-stack web application designed to help users efficiently track and manage their expenses. Built with a modern tech stack, it provides a user-friendly interface to add, edit, delete, and analyze expenses, offering visual insights into spending patterns.

## Features ✨

- **User Authentication**: Secure signup and login with JWT-based authentication 🔐.
- **Expense Management**: Add, update, and delete expenses with categories, amounts, and optional comments 📊.
- **Dashboard**: View a summary of expenses, recent transactions, and a pie chart of spending by category 🏠.
- **Analytics**: Visualize expenses by category and monthly trends using bar and line charts 📈.
- **Currency Formatting**: Displays amounts in INR (₹) with proper formatting 💵.
- **Responsive Design**: Works seamlessly on desktop and mobile devices 📱💻.
- **Error Handling**: Robust validation and error messages for a smooth user experience 🚫.

## Tech Stack 🛠️

### Frontend

- **React**: For building the user interface.
- **React Router**: For client-side routing.
- **Axios**: For API requests.
- **Recharts**: For data visualization (charts).
- **Sonner**: For toast notifications.
- **Lucide React**: For icons.
- **Tailwind CSS**: For styling.

### Backend

- **Node.js & Express**: For the server and API.
- **MongoDB & Mongoose**: For the database and ORM.
- **jsonwebtoken**: For authentication.
- **dotenv**: For environment variables.

## Prerequisites ⚙️

Before you get started, make sure you have the following installed:

- **Node.js**: v16 or higher.
- **MongoDB**: Local or Atlas instance.
- **npm**: For package management.

## Installation 🔧

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/your-username/expense-tracker.git
   cd expense-tracker
   ```

2. **Set Up the Backend**:

   - Navigate to the server directory:
     ```bash
     cd server
     ```
   - Install dependencies:
     ```bash
     npm install
     ```
   - Create a `.env` file in `server/` with the following:
     ```
     PORT=5000
     MONGODB_URI=mongodb://localhost:27017/expense-tracker
     JWT_SECRET=your_jwt_secret_here
     ```
     Replace `your_jwt_secret_here` with a secure 32-character string.
   - Start the server:
     ```bash
     npm run dev
     ```
     The server will run at `http://localhost:5000`.

3. **Set Up the Frontend**:

   - Navigate to the client directory:
     ```bash
     cd client
     ```
   - Install dependencies:
     ```bash
     npm install
     ```
   - Start the development server:
     ```bash
     npm run dev
     ```
     The client will run at `http://localhost:3000`.

4. **Set Up MongoDB**:
   - Ensure MongoDB is running locally (using `mongod`) or use MongoDB Atlas.
   - Update `MONGODB_URI` in `server/.env` if using a remote database.

## Usage 🚀

### Register/Login:

- Open `http://localhost:3000` in your browser.
- Sign up with an email and password, or log in if you already have an account.
- A JWT token will be stored in `localStorage` for authentication.

### Manage Expenses:

- On the Dashboard, use the form to add a new expense (select a category, enter an amount, and add optional comments).
- Edit or delete expenses from the table.
- View a summary of total expenses, monthly spending, and a distribution chart.

### View Analytics:

- Navigate to the Analytics page to see expenses by category (bar chart) and monthly trends (line chart).

### Logout:

- Click the "Logout" button in the navbar to clear the token and return to the login page.

## Project Structure 🗂️

expense-tracker/
├── client/ # Frontend (React)
│ ├── src/
│ │ ├── api/ # API calls (api.js)
│ │ ├── components/ # Reusable components (Button, Navbar)
│ │ ├── features/ # Feature-specific components (ExpenseForm, ExpenseTable)
│ │ ├── pages/ # Page components (Dashboard, Analytics)
│ │ ├── utils/ # Utilities (formatCurrency.js, authUtils.js)
│ │ └── App.jsx # Main app component
├── server/ # Backend (Node.js/Express)
│ ├── src/
│ │ ├── controllers/ # API logic (expenseController.js, authController.js)
│ │ ├── middlewares/ # Middleware (authMiddleware.js, errorMiddleware.js)
│ │ ├── models/ # Mongoose schemas (Expense.js, User.js)
│ │ ├── routes/ # API routes (expenseRoutes.js, authRoutes.js)
│ │ ├── utils/ # Utilities (errorHandler.js)
│ │ └── index.js # Server entry point
├── README.md
├── client/package.json
└── server/package.json

## API Endpoints 📝

### Authentication

- **POST /api/auth/signup**: Register a new user.
  - Body: `{ "email": "user@example.com", "password": "password123" }`
- **POST /api/auth/login**: Log in and receive a JWT token.
  - Body: `{ "email": "user@example.com", "password": "password123" }`

### Expenses

- **POST /api/expenses**: Create an expense (requires auth).
  - Body: `{ "category": "Groceries", "amount": 500, "comments": "Weekly shopping" }`
- **GET /api/expenses**: Get all expenses for the user (requires auth).
- **PUT /api/expenses/:id**: Update an expense (requires auth).
  - Body: `{ "category": "Dining", "amount": 300, "comments": "Dinner" }`
- **DELETE /api/expenses/:id**: Delete an expense (requires auth).

- **GET /api/expenses/distribution**: Get expense distribution by category (requires auth).

### Error Handling

- **Frontend**: Uses `Sonner` for toast notifications and validates inputs before API calls.
- **Backend**: Custom error handling with a structured error response system.

## Troubleshooting 🛠️

- **500 Internal Server Error**:

  - Check server logs for details (Create expense error, Auth middleware error).
  - Ensure `req.user` is set in `expenseController.js` (requires `protect` middleware).
  - Verify `MONGODB_URI` and `JWT_SECRET` in `server/.env`.

- **Invalid Token**:

  - Clear `localStorage` (`localStorage.removeItem('token')`) and log in again.
  - Ensure `JWT_SECRET` matches between server and token generation.

- **CORS Issues**:

  - Ensure the server allows `http://localhost:3000`:
    ```js
    const cors = require("cors");
    app.use(cors({ origin: "http://localhost:3000" }));
    ```

- **Form Submission Errors**:
  - Check browser DevTools (Console/Network) for API request details.
  - Log form data in `ExpenseForm.jsx`: `console.log('Submitting form data:', formData);`

## Future Improvements 🌟

- Add pagination for expense lists.
- Implement budget planning and alerts.
- Support multiple currencies.
- Add user profile management.
- Deploy to a cloud platform (e.g., Vercel, Heroku).

## Contributing 🤝

Contributions are welcome! Please follow these steps to contribute:

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/your-feature`).
3. Commit your changes (`git commit -m "Add your feature"`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Open a pull request.

## License 📝

This project is licensed under the MIT License.

## Contact 📧

For issues or suggestions, open an issue on GitHub or contact [your-email@example.com](mailto:your-email@example.com).
