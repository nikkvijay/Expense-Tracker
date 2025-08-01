# Smart Expense Organizer 🧾💸

Smart Expense Organizer is a comprehensive full-stack web application designed to help users efficiently track, manage, and analyze their financial expenses with AI-powered insights. Built with a modern tech stack and premium design system, it provides an intuitive interface for complete expense management.

## Features ✨

### Core Features
- **User Authentication**: Secure signup and login with JWT-based authentication 🔐
- **Expense Management**: Add, update, and delete expenses with categories, amounts, and optional comments 📊
- **Income Tracking**: Track multiple income sources with recurring income support 💰
- **Dashboard**: Comprehensive overview with expense summaries, recent transactions, and visual analytics 🏠
- **Analytics**: Advanced data visualization with category distribution, monthly trends, and spending patterns 📈
- **Budget Tracking**: Set and monitor budgets with progress indicators and alerts 🎯

### AI-Powered Features
- **AI Chatbot Assistant**: Natural language expense management - "I spent $25 on lunch" 🤖
- **Smart Categorization**: Automatic expense categorization using AI 🧠
- **Spending Analysis**: AI-driven insights and spending pattern analysis 📊
- **Budget Recommendations**: Personalized budget suggestions based on spending habits 💡
- **Anomaly Detection**: Identify unusual spending patterns and potential issues ⚠️
- **Financial Insights**: Comprehensive financial health reports and recommendations 📋

### Design & UX
- **Premium Design System**: Modern gradient-based UI with smooth animations ✨
- **Dark/Light Mode**: Automatic theme switching with system preference detection 🌓
- **Responsive Design**: Seamless experience across desktop, tablet, and mobile devices 📱💻
- **Real-time Notifications**: Toast notifications for all user actions 🔔
- **Currency Formatting**: Flexible currency display with proper formatting 💵

## Tech Stack 🛠️

### Frontend (React + TypeScript)
- **React 19.1.0**: Latest React with concurrent features and improved performance
- **TypeScript**: Type-safe development with enhanced developer experience
- **Vite**: Lightning-fast build tool and development server
- **React Router DOM**: Client-side routing with nested routes
- **Axios**: Promise-based HTTP client for API requests
- **Recharts**: Responsive chart library for data visualization
- **Tailwind CSS**: Utility-first CSS framework with custom design system
- **Radix UI**: Headless UI components for accessibility
- **Lucide React**: Modern icon library with 1000+ icons
- **Sonner**: Beautiful toast notifications
- **Class Variance Authority**: Type-safe component variants

### Backend (Node.js + Express)
- **Node.js & Express**: Server runtime and web framework
- **MongoDB & Mongoose**: NoSQL database with ODM for data modeling
- **JWT (jsonwebtoken)**: Secure token-based authentication
- **bcryptjs**: Password hashing and encryption
- **CORS**: Cross-origin resource sharing configuration
- **dotenv**: Environment variable management
- **Nodemon**: Development server with auto-restart

### AI Integration
- **Google Gemini API**: Advanced AI model for natural language processing
- **Custom AI Service**: Expense categorization and financial insights
- **Smart Chatbot**: Natural language expense management interface
- **Pattern Recognition**: Spending analysis and anomaly detection

## Prerequisites ⚙️

Before you get started, make sure you have the following installed:

- **Node.js**: v18 or higher (v20+ recommended)
- **npm**: v8 or higher (comes with Node.js)
- **MongoDB**: Local instance or MongoDB Atlas (cloud)
- **Git**: For version control
- **Google Gemini API Key**: For AI features (optional)

## Installation 🔧

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/expense-tracker.git
cd expense-tracker
```

### 2. Backend Setup (Server)
```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create environment file
touch .env
```

**Configure Backend Environment** (`.env` in `/server/`):
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/expense-tracker

# Authentication
JWT_SECRET=your-super-secure-jwt-secret-key-minimum-32-characters

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# AI Integration (Optional)
GEMINI_API_KEY=your-google-gemini-api-key
```

**Start Backend Server:**
```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```
Server runs at: `http://localhost:5000`

### 3. Frontend Setup (ET-frontend)
```bash
# Navigate to frontend directory
cd ../ET-frontend

# Install dependencies
npm install

# Create environment file
touch .env
```

**Configure Frontend Environment** (`.env` in `/ET-frontend/`):
```env
# API Configuration
VITE_API_URL=http://localhost:5000/api
```

**Start Frontend Development Server:**
```bash
npm run dev
```
Frontend runs at: `http://localhost:5173`

### 4. Database Setup
**Option A: MongoDB Atlas (Recommended)**
1. Create account at [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a new cluster
3. Get connection string and update `MONGODB_URL` in server `.env`

**Option B: Local MongoDB**
```bash
# Install MongoDB locally
# macOS (using Homebrew)
brew install mongodb/brew/mongodb-community

# Ubuntu/Debian
sudo apt install mongodb

# Start MongoDB service
mongod
```

### 5. AI Features Setup (Optional)
1. Get Google Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Add `GEMINI_API_KEY` to server `.env` file
3. AI features include:
   - Smart expense categorization
   - Natural language chatbot
   - Spending analysis and insights

## Usage 🚀

### 1. Authentication
- **Access the app**: Open `http://localhost:5173` in your browser
- **Sign Up**: Create a new account with email and password
- **Login**: Access existing account with credentials
- **JWT Token**: Automatically stored in `localStorage` for session management

### 2. Dashboard Overview
- **Expense Summary**: View total expenses, monthly spending, and budget progress
- **Recent Transactions**: Quick overview of latest expense entries
- **Visual Analytics**: Pie charts showing spending distribution by category
- **Quick Actions**: Add new expenses directly from dashboard

### 3. Expense Management
- **Add Expenses**: 
  - Select from 8 predefined categories (Food, Transport, Entertainment, etc.)
  - Enter amount with automatic currency formatting
  - Add optional comments/descriptions
  - Choose payment method (Card, Cash, Account, Digital)
  - Set custom date or use current date
- **Edit/Delete**: Modify or remove existing expenses from the expense table
- **Smart Categorization**: AI suggests categories based on description

### 4. Income Tracking
- **Add Income Sources**: Salary, Freelance, Investment, Business, Other
- **Recurring Income**: Set weekly, monthly, or yearly recurring income
- **Income Analytics**: Track income vs expenses for better financial planning

### 5. AI Chatbot Assistant
- **Natural Language Processing**: "I spent $25 on lunch at McDonald's"
- **Smart Actions**: Automatically creates expense entries from conversation
- **Financial Queries**: Ask about spending patterns, budgets, and insights
- **Command Examples**:
  - "Add $50 grocery expense"
  - "Show my expenses this month"
  - "Delete last transaction"
  - "What's my biggest expense category?"

### 6. Analytics & Insights
- **Category Distribution**: Visual breakdown of spending by category
- **Monthly Trends**: Line charts showing spending patterns over time
- **Payment Method Analysis**: How you prefer to pay for different categories
- **AI Insights**: Personalized spending recommendations and anomaly detection

### 7. Settings & Preferences
- **Theme Toggle**: Switch between light and dark modes
- **Currency Display**: Customize currency formatting
- **Profile Management**: Update email and password
- **Data Export**: Export expense data for external analysis

## Project Structure 🗂️

```
expense-tracker/
├── 📁 ET-frontend/                    # Frontend (React + TypeScript)
│   ├── 📁 src/
│   │   ├── 📁 api/                    # API layer & HTTP client
│   │   │   └── index.ts               # Axios configuration & API calls
│   │   ├── 📁 components/             # Reusable UI components
│   │   │   ├── 📁 ui/                 # Base UI components (Radix)
│   │   │   │   ├── button.tsx         # Custom button variants
│   │   │   │   ├── card.tsx           # Card component
│   │   │   │   ├── dialog.tsx         # Modal dialogs
│   │   │   │   ├── input.tsx          # Form inputs
│   │   │   │   └── ...                # Other UI primitives
│   │   │   ├── 📁 chatbot/            # AI Chatbot components
│   │   │   │   ├── Chatbot.tsx        # Main chatbot interface
│   │   │   │   └── ChatbotButton.tsx  # Chatbot trigger button
│   │   │   ├── 📁 expense-tracker/    # Expense management components
│   │   │   │   ├── ExpenseForm.tsx    # Add/Edit expense form
│   │   │   │   ├── ExpenseList.tsx    # Expense table/list
│   │   │   │   ├── ExpenseChart.tsx   # Pie chart visualization
│   │   │   │   ├── ExpenseBarGraph.tsx # Bar chart analytics
│   │   │   │   ├── BudgetTracker.tsx  # Budget progress tracking
│   │   │   │   ├── CategoryStats.tsx  # Category-wise statistics
│   │   │   │   └── IncomeTracker.tsx  # Income management
│   │   │   ├── 📁 Home/               # Home page components
│   │   │   │   └── Navbar.tsx         # Navigation header
│   │   │   └── ProtectedRoute.tsx     # Authentication guard
│   │   ├── 📁 pages/                  # Page-level components
│   │   │   ├── 📁 Auth/               # Authentication pages
│   │   │   │   ├── Login.tsx          # Login form
│   │   │   │   └── Signup.tsx         # Registration form
│   │   │   ├── 📁 Dashboard/          # Main dashboard
│   │   │   │   └── Dashboard.tsx      # Dashboard overview
│   │   │   ├── 📁 Analytics/          # Analytics & reports
│   │   │   │   └── Analytics.tsx      # Advanced analytics page
│   │   │   ├── Settings.tsx           # User settings & preferences
│   │   │   └── NotFound.tsx           # 404 error page
│   │   ├── 📁 contexts/               # React Context providers
│   │   │   ├── ThemeContext.tsx       # Dark/Light mode context
│   │   │   └── CurrencyContext.tsx    # Currency formatting context
│   │   ├── 📁 lib/                    # Utility libraries
│   │   │   └── utils.ts               # Helper functions
│   │   ├── 📁 utils/                  # Application utilities
│   │   │   └── exportData.ts          # Data export functionality
│   │   ├── App.tsx                    # Root application component
│   │   ├── AppRouter.tsx              # Route configuration
│   │   ├── main.tsx                   # Application entry point
│   │   └── index.css                  # Global styles & CSS variables
│   ├── 📄 .env                        # Environment variables
│   ├── 📄 package.json                # Dependencies & scripts
│   ├── 📄 tailwind.config.js          # Tailwind CSS configuration
│   ├── 📄 vite.config.ts              # Vite build configuration
│   └── 📄 tsconfig.json               # TypeScript configuration
├── 📁 server/                         # Backend (Node.js + Express)
│   ├── 📁 src/
│   │   ├── 📁 controllers/            # Business logic controllers
│   │   │   ├── authController.js      # Authentication logic
│   │   │   ├── expenseController.js   # Expense CRUD operations
│   │   │   ├── incomeController.js    # Income management
│   │   │   ├── aiController.js        # AI service integration
│   │   │   └── chatbotController.js   # Chatbot message handling
│   │   ├── 📁 middleware/             # Express middleware
│   │   │   ├── authMiddleware.js      # JWT authentication
│   │   │   └── errorMiddleware.js     # Error handling
│   │   ├── 📁 models/                 # MongoDB/Mongoose schemas
│   │   │   ├── User.js                # User data model
│   │   │   ├── Expenses.js            # Expense data model
│   │   │   └── Income.js              # Income data model
│   │   ├── 📁 routes/                 # API route definitions
│   │   │   ├── authRoutes.js          # Authentication endpoints
│   │   │   ├── expenseRoutes.js       # Expense CRUD endpoints
│   │   │   ├── incomeRoutes.js        # Income management endpoints
│   │   │   ├── aiRoutes.js            # AI service endpoints
│   │   │   └── chatbotRoutes.js       # Chatbot API endpoints
│   │   ├── 📁 services/               # Business logic services
│   │   │   ├── aiService.js           # Google Gemini AI integration
│   │   │   └── chatbotService.js      # Natural language processing
│   │   ├── 📁 config/                 # Configuration files
│   │   │   └── db.js                  # MongoDB connection setup
│   │   └── 📁 utils/                  # Utility functions
│   │       └── errorHandler.js        # Custom error handling
│   ├── 📄 .env                        # Environment variables
│   ├── 📄 server.js                   # Express server entry point
│   ├── 📄 package.json                # Dependencies & scripts
│   └── 📄 vercel.json                 # Deployment configuration
├── 📄 README.md                       # Project documentation
└── 📄 .gitignore                      # Git ignore rules
```

## API Endpoints 📝

### 🔐 Authentication Routes
| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| `POST` | `/api/auth/signup` | Register new user | `{ "email": "user@example.com", "password": "password123" }` |
| `POST` | `/api/auth/login` | User login & get JWT token | `{ "email": "user@example.com", "password": "password123" }` |
| `GET` | `/api/auth/profile` | Get current user profile | - |
| `PUT` | `/api/auth/profile` | Update user profile | `{ "email": "newemail@example.com" }` |
| `PUT` | `/api/auth/change-password` | Change user password | `{ "currentPassword": "old", "newPassword": "new" }` |

### 💰 Expense Management Routes
| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| `POST` | `/api/expenses` | Create new expense | `{ "category": "Food", "amount": 25.50, "comments": "Lunch", "paymentMethod": "card", "date": "2024-01-15" }` |
| `GET` | `/api/expenses` | Get all user expenses | - |
| `GET` | `/api/expenses/:id` | Get specific expense | - |
| `PUT` | `/api/expenses/:id` | Update expense | `{ "category": "Transport", "amount": 15.00, "comments": "Bus fare" }` |
| `DELETE` | `/api/expenses/:id` | Delete expense | - |
| `GET` | `/api/expenses/distribution` | Get spending by category | - |

### 💵 Income Management Routes
| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| `POST` | `/api/incomes` | Add new income | `{ "source": "salary", "amount": 5000, "description": "Monthly salary", "isRecurring": true, "frequency": "monthly" }` |
| `GET` | `/api/incomes` | Get all user income | - |
| `GET` | `/api/incomes/total` | Get total income (filtered) | Query: `?month=1&year=2024` |
| `PUT` | `/api/incomes/:id` | Update income entry | `{ "amount": 5500, "description": "Salary increase" }` |
| `DELETE` | `/api/incomes/:id` | Delete income entry | - |

### 🤖 AI & Chatbot Routes
| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| `POST` | `/api/ai/categorize` | AI expense categorization | `{ "description": "McDonald's lunch" }` |
| `GET` | `/api/ai/analyze` | Get spending analysis | - |
| `GET` | `/api/ai/insights` | Get financial insights | - |
| `GET` | `/api/ai/budget-recommendations` | Get budget suggestions | - |
| `GET` | `/api/ai/anomalies` | Detect spending anomalies | - |
| `POST` | `/api/chatbot/message` | Send message to AI chatbot | `{ "message": "I spent $25 on lunch" }` |
| `GET` | `/api/chatbot/history` | Get chat conversation history | Query: `?limit=20` |
| `DELETE` | `/api/chatbot/history` | Clear chat history | - |
| `GET` | `/api/chatbot/capabilities` | Get chatbot capabilities | - |

### 📊 Response Formats

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description",
  "statusCode": 400
}
```

**Authentication:**
- All routes except `/auth/signup` and `/auth/login` require JWT token
- Include in header: `Authorization: Bearer <jwt-token>`
- Token automatically handled by frontend API client

## Troubleshooting 🛠️

### Common Issues & Solutions

#### 🚫 CORS Errors
**Error:** `Access to XMLHttpRequest blocked by CORS policy`

**Solutions:**
1. **Check Environment Variables:**
   ```bash
   # In server/.env
   FRONTEND_URL=http://localhost:5173
   ```
2. **Verify server CORS configuration in `server.js`**
3. **Restart backend server** after environment changes
4. **Clear browser cache** and hard refresh (Ctrl+F5)

#### 🔐 Authentication Issues
**Error:** `No token provided` or `Invalid token`

**Solutions:**
1. **Clear localStorage and login again:**
   ```javascript
   localStorage.removeItem('token');
   localStorage.removeItem('userId');
   ```
2. **Check JWT_SECRET** in server `.env` matches token generation
3. **Verify token format:** Should start with `Bearer ` in Authorization header
4. **Check token expiration** - tokens may expire after set time

#### 🗄️ Database Connection Issues
**Error:** `MongoServerError: Authentication failed`

**Solutions:**
1. **Verify MongoDB URL** in server `.env`:
   ```env
   MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/expense-tracker
   ```
2. **Check MongoDB Atlas IP whitelist** (add 0.0.0.0/0 for development)
3. **Ensure database user has proper permissions**
4. **Test connection manually** using MongoDB Compass

#### 🤖 AI Features Not Working
**Error:** Chatbot or AI categorization fails

**Solutions:**
1. **Add Gemini API key** to server `.env`:
   ```env
   GEMINI_API_KEY=your-google-gemini-api-key
   ```
2. **Verify API key permissions** in Google AI Studio
3. **Check API quotas** and usage limits
4. **Restart server** after adding API key

#### 📱 Frontend Build Issues
**Error:** Vite build or dev server fails

**Solutions:**
1. **Clear node_modules and reinstall:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```
2. **Check Node.js version** (requires v18+)
3. **Verify environment file** exists in ET-frontend/.env
4. **Clear Vite cache:**
   ```bash
   npm run dev -- --force
   ```

#### 🔄 Server Startup Issues
**Error:** Server fails to start or crashes

**Solutions:**
1. **Check all required environment variables:**
   ```env
   PORT=5000
   MONGODB_URL=...
   JWT_SECRET=...
   FRONTEND_URL=http://localhost:5173
   ```
2. **Verify all route files exist:**
   - `chatbotRoutes.js` - ✅ Created during troubleshooting
   - `aiRoutes.js` - ✅ Added to server.js
3. **Check for syntax errors** in recently modified files
4. **Run with verbose logging:**
   ```bash
   DEBUG=* npm run dev
   ```

### Development Tools

#### Browser DevTools
- **Console:** Check for JavaScript errors and API responses
- **Network:** Monitor API requests and response status codes
- **Application:** Inspect localStorage for authentication tokens
- **Sources:** Debug frontend code with breakpoints

#### Server Debugging
```bash
# Enable detailed logging
DEBUG=express:* npm run dev

# Check server processes
ps aux | grep node

# Monitor server logs
tail -f server.log
```

#### Database Debugging
```bash
# Test MongoDB connection
mongosh "mongodb+srv://cluster.mongodb.net/expense-tracker"

# Check database collections
db.expenses.find().limit(5)
db.users.find().limit(5)
```

## Recent Updates & Fixes 🔧

### 🚀 Latest Changes (2024)
1. **Fixed CORS Issues**: Added proper CORS configuration for `http://localhost:5173`
2. **Created Missing Routes**: Added `chatbotRoutes.js` for AI chatbot functionality
3. **Enhanced Error Handling**: Improved authentication error messages in chatbot component
4. **Updated Server Configuration**: Added AI and chatbot route registration
5. **Environment Setup**: Documented proper `.env` configuration for both frontend and backend

### 📁 Files Recently Modified
- ✅ `server/server.js` - Added AI and chatbot route imports and registration
- ✅ `server/src/routes/chatbotRoutes.js` - Created new file with chatbot endpoints
- ✅ `ET-frontend/src/components/chatbot/Chatbot.tsx` - Enhanced error handling for auth failures
- ✅ `README.md` - Comprehensive documentation update

## Future Improvements 🌟

### Core Features
- [ ] **Expense Categories**: Custom user-defined categories
- [ ] **Budget Alerts**: Email/SMS notifications for budget limits
- [ ] **Multi-Currency**: Support for international currencies with real-time exchange rates
- [ ] **Recurring Expenses**: Automatic recurring transaction tracking
- [ ] **Data Export**: PDF/Excel export functionality
- [ ] **Expense Photos**: Receipt photo uploads with OCR text extraction

### AI & Analytics
- [ ] **Predictive Analytics**: Forecast future spending patterns
- [ ] **Smart Budgeting**: AI-powered budget recommendations
- [ ] **Expense Optimization**: Suggestions for cost savings
- [ ] **Voice Commands**: Voice-to-text expense entry
- [ ] **Advanced Insights**: Seasonal spending analysis and trends

### Technical Improvements
- [ ] **Real-time Updates**: WebSocket integration for live data sync
- [ ] **Offline Support**: PWA capabilities with offline data sync
- [ ] **Performance**: Infinite scroll pagination for large datasets
- [ ] **Security**: Two-factor authentication (2FA)
- [ ] **API Rate Limiting**: Advanced rate limiting and caching
- [ ] **Microservices**: Split into microservices architecture

### Mobile & Desktop
- [ ] **Mobile App**: React Native companion app
- [ ] **Desktop App**: Electron desktop application
- [ ] **Browser Extension**: Quick expense entry browser extension
- [ ] **Widgets**: Dashboard widgets for quick overview

## Deployment 🚀

### Frontend (Vercel)
```bash
# Build for production
npm run build

# Deploy to Vercel
vercel --prod
```

### Backend (Railway/Heroku)
```bash
# Create Procfile
echo "web: node server.js" > Procfile

# Deploy to Railway
railway deploy
```

### Environment Variables for Production
```env
# Backend Production
NODE_ENV=production
MONGODB_URL=mongodb+srv://...
JWT_SECRET=your-production-secret
FRONTEND_URL=https://your-frontend-domain.vercel.app
GEMINI_API_KEY=your-production-api-key

# Frontend Production
VITE_API_URL=https://your-backend-domain.railway.app/api
```

## Contributing 🤝

We welcome contributions! Here's how to contribute:

### Development Workflow
1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/expense-tracker.git
   ```
3. **Create a feature branch**:
   ```bash
   git checkout -b feature/amazing-feature
   ```
4. **Set up development environment** (see Installation section)
5. **Make your changes** with proper testing
6. **Commit with descriptive messages**:
   ```bash
   git commit -m "feat: add amazing feature for expense analytics"
   ```
7. **Push to your fork**:
   ```bash
   git push origin feature/amazing-feature
   ```
8. **Create a Pull Request** on GitHub

### Code Style Guidelines
- **Frontend**: Use TypeScript with strict mode
- **Backend**: Follow Node.js best practices
- **Commits**: Use [Conventional Commits](https://conventionalcommits.org/)
- **Testing**: Write tests for new features
- **Documentation**: Update README.md for significant changes

### Issues & Bug Reports
- Use GitHub Issues for bug reports and feature requests
- Include browser/OS information for bugs
- Provide step-by-step reproduction instructions
- Add screenshots or screen recordings when helpful

## License 📝

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### MIT License Summary
- ✅ Commercial use allowed
- ✅ Modification allowed
- ✅ Distribution allowed
- ✅ Private use allowed
- ❌ No warranty provided
- ❌ No liability assumed

## Contact & Support 📧

### Get Help
- **GitHub Issues**: [Create an issue](https://github.com/your-username/expense-tracker/issues) for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions and community support
- **Documentation**: Check this README for setup and troubleshooting

### Connect
- **Email**: [your-email@example.com](mailto:your-email@example.com)
- **LinkedIn**: [Your LinkedIn Profile](https://linkedin.com/in/your-profile)
- **Portfolio**: [your-portfolio.com](https://your-portfolio.com)

### Acknowledgments
- **React Team** for the amazing React framework
- **Vercel** for seamless deployment platform
- **MongoDB** for reliable database service
- **Google AI** for Gemini API integration
- **Open Source Community** for invaluable libraries and tools

---

**⭐ Star this repository if you found it helpful!**

**🐛 Found a bug?** [Report it here](https://github.com/your-username/expense-tracker/issues/new?template=bug_report.md)

**💡 Have a feature idea?** [Suggest it here](https://github.com/your-username/expense-tracker/issues/new?template=feature_request.md)
