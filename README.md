#  QuizNerds

A modern, feature-rich quiz application built with React and Node.js. QuizNerds offers an engaging quiz experience with multiplayer sessions, achievements, daily challenges, power-ups, custom quiz creation, and a social friends system.

![QuizNerds](https://img.shields.io/badge/QuizNerds-v1.0.0-purple)
![React](https://img.shields.io/badge/React-19.1.0-blue)
![Node.js](https://img.shields.io/badge/Node.js-Express-green)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-brightgreen)

---

##  Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Project Structure](#-project-structure)
- [API Endpoints](#-api-endpoints)
- [Usage Guide](#-usage-guide)
- [Keyboard Shortcuts](#-keyboard-shortcuts)
- [Contributing](#-contributing)
- [License](#-license)

---

##  Features

###  Core Quiz Features
- **Multiple Question Sources**: OpenTDB, Trivia API, and custom user-created quizzes
- **Difficulty Levels**: Easy, Medium, Hard
- **Categories**: Science, History, Geography, Entertainment, Sports, and more
- **Timer System**: Countdown timer for each question with audio feedback
- **Progress Tracking**: Visual progress bar and real-time completion percentage
- **Answer Review**: Detailed review of all answers with explanations

###  Gamification
- **Achievement System**: 12+ achievements with different rarities (Common, Rare, Epic, Legendary)
- **XP & Leveling**: Progressive leveling system with titles and rewards
- **Daily Challenges**: Special themed quizzes with bonus rewards
- **Streak Tracking**: Maintain streaks for bonus XP and achievements
- **Power-ups**: Skip Question, Extra Time, Double Points, Reveal Answer (50/50)
- **Celebration Animations**: Confetti and animations for achievements and milestones

### 👥 Social & Multiplayer
- **Friends System**: Add, remove, and manage friends
- **Friend Invitations**: Invite friends to multiplayer sessions
- **Multiplayer Sessions**: Create private or public multiplayer quiz sessions
- **Public Sessions**: Join open multiplayer games with random players
- **Session Codes**: Easy 6-character codes to join private sessions
- **Real-time Leaderboard**: Live score tracking during multiplayer games
- **Friend Stats**: View friend statistics (coming soon)

###  Modern UI/UX
- **Glassmorphism Design**: Modern glass-like effects with backdrop blur
- **Dark/Light Themes**: Toggle between themes with smooth transitions
- **Responsive Layout**: Fully responsive design for all devices
- **Smooth Animations**: Engaging micro-interactions and transitions
- **Sound Effects**: Audio feedback for actions, correct/wrong answers, and background music
- **Loading States**: Beautiful loading spinners and skeleton screens

###  Learning Features
- **Learning Mode**: Detailed explanations for wrong answers
- **Answer Review**: Comprehensive review modal after quiz completion
- **Custom Quiz Creation**: Create, edit, and delete your own quizzes
- **Statistics Tracking**: Performance analytics, history, and progress tracking
- **Category Performance**: Track performance by category

###  Authentication & Security
- **JWT Authentication**: Secure token-based authentication
- **Email Verification**: Email verification system for account security
- **Password Hashing**: Bcrypt password hashing
- **Protected Routes**: Middleware-based route protection
- **Rate Limiting**: API rate limiting for security

###  Custom Quiz Features
- **Quiz Builder**: Intuitive quiz creation tool
- **Edit & Delete**: Full CRUD operations for custom quizzes
- **Question Types**: Multiple choice, multi-select, and true/false questions
- **Custom Categories**: Organize quizzes by custom categories
- **Difficulty Settings**: Set difficulty levels for custom quizzes

---

##  Tech Stack

### Frontend
- **React 19.1.0** - Modern React with latest features
- **Vite 6.3.5** - Fast build tool and dev server
- **Tailwind CSS 4.1.10** - Utility-first CSS framework
- **React Confetti** - Celebration animations

### Backend
- **Node.js** - JavaScript runtime
- **Express 5.1.0** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose 8.18.1** - MongoDB object modeling
- **JWT (jsonwebtoken)** - Authentication tokens
- **Bcrypt.js** - Password hashing
- **Nodemailer** - Email sending
- **Zod** - Schema validation
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing

### Development Tools
- **Nodemon** - Auto-restart server during development
- **ESLint** - Code linting
- **Dotenv** - Environment variable management

---

##  Getting Started

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MongoDB** (local or cloud instance like MongoDB Atlas)
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd react-quiz-app-main
   ```

2. **Install root dependencies**
   ```bash
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd client
   npm install
   ```

4. **Install server dependencies**
   ```bash
   cd ../server
   npm install
   ```

5. **Set up environment variables** (see [Environment Variables](#-environment-variables))

6. **Start the development servers**

   **Terminal 1 - Start the server:**
   ```bash
   cd server
   npm run dev
   ```
   Server will run on `http://localhost:4000`

   **Terminal 2 - Start the client:**
   ```bash
   cd client
   npm run dev
   ```
   Client will run on `http://localhost:5173`

7. **Open your browser**
   Navigate to `http://localhost:5173` to see the application

---

##  Environment Variables

Create a `.env` file in the `server` directory with the following variables:

```env
# Server Configuration
PORT=4000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/quizapp
# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/quizapp
MONGODB_DB_NAME=quizapp

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Email Configuration (Optional - for email verification)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
# For Gmail, you'll need to generate an App Password

# Client URL (for email verification links)
CLIENT_URL=http://localhost:5173
```

### Email Setup (Optional)

If you want email verification to work:

1. **Gmail Setup:**
   - Go to Google Account settings
   - Enable 2-Step Verification
   - Generate an App Password
   - Use the app password as `EMAIL_PASS`

2. **Other Email Providers:**
   - Check your email provider's documentation for SMTP settings
   - Update the email configuration in `server/src/routes/auth.js` if needed

---

##  Project Structure

```
react-quiz-app-main/
├── client/                 # React frontend application
│   ├── public/            # Static assets (images, sounds)
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── AddFriends.jsx
│   │   │   ├── AchievementSystem.jsx
│   │   │   ├── DailyChallenge.jsx
│   │   │   ├── EmailVerification.jsx
│   │   │   ├── InviteFriendsModal.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── MultiplayerLobby.jsx
│   │   │   ├── MultiplayerSession.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   ├── QuizCreationTool.jsx
│   │   │   └── ... (other components)
│   │   ├── config/        # Configuration files
│   │   │   └── api.js      # API endpoint configuration
│   │   ├── services/      # API service functions
│   │   └── App.jsx        # Main application component
│   ├── package.json
│   └── vite.config.js
│
├── server/                 # Node.js backend application
│   ├── src/
│   │   ├── models/         # Mongoose models
│   │   │   ├── User.js
│   │   │   ├── Quiz.js
│   │   │   ├── Attempt.js
│   │   │   ├── MultiplayerSession.js
│   │   │   └── FriendRequest.js
│   │   ├── routes/         # Express routes
│   │   │   ├── users.js    # User registration/login
│   │   │   ├── auth.js      # Email verification
│   │   │   ├── friends.js  # Friends system
│   │   │   ├── multiplayer.js  # Multiplayer sessions
│   │   │   ├── quizzes.js  # Quiz management
│   │   │   └── external.js # External API integration
│   │   ├── middleware/     # Express middleware
│   │   │   └── auth.js     # JWT authentication
│   │   ├── services/       # Service layer
│   │   │   ├── db.js       # Database connection
│   │   │   └── externalFormat.js
│   │   └── server.js        # Express server setup
│   ├── package.json
│   └── .env                # Environment variables (create this)
│
└── README.md
```

---

##  API Endpoints

### Authentication
- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login user
- `GET /api/users/me` - Get current user info
- `GET /api/users/:userId` - Get user by ID

### Email Verification
- `POST /api/auth/request-verification` - Request verification email
- `GET /api/auth/verify-email?token=:token` - Verify email with token

### Friends
- `GET /api/friends` - Get all friends (requires auth)
- `GET /api/friends/search?query=:query` - Search for users
- `POST /api/friends/request` - Send friend request
- `GET /api/friends/requests` - Get pending requests
- `POST /api/friends/accept` - Accept friend request
- `POST /api/friends/decline` - Decline friend request
- `DELETE /api/friends/:friendId` - Remove friend

### Multiplayer
- `POST /api/multiplayer/create` - Create multiplayer session
- `POST /api/multiplayer/join` - Join session by code
- `POST /api/multiplayer/join-public` - Join random public session
- `GET /api/multiplayer/public-sessions` - Get all public sessions
- `GET /api/multiplayer/session/:sessionCode` - Get session details
- `POST /api/multiplayer/start/:sessionCode` - Start session (host only)
- `POST /api/multiplayer/session/:sessionCode/answer` - Submit answer
- `GET /api/multiplayer/session/:sessionCode/leaderboard` - Get leaderboard
- `POST /api/multiplayer/invite` - Invite friends to session
- `POST /api/multiplayer/accept-invitation` - Accept session invitation
- `POST /api/multiplayer/decline-invitation` - Decline session invitation
- `POST /api/multiplayer/end/:sessionCode` - End session
- `POST /api/multiplayer/leave/:sessionCode` - Leave session

### Quizzes
- `GET /api/quizzes` - Get all quizzes
- `POST /api/quizzes` - Create quiz
- `GET /api/quizzes/:id` - Get quiz by ID
- `PUT /api/quizzes/:id` - Update quiz
- `DELETE /api/quizzes/:id` - Delete quiz

### External APIs
- `GET /api/external/opentdb` - Fetch questions from OpenTDB
- `GET /api/external/trivia` - Fetch questions from Trivia API

---

##  Usage Guide

### Registration & Login
1. Click "Register" on the login screen
2. Enter your username, email, password, and confirm password
3. After registration, you'll be automatically logged in
4. Check your email for verification (if email is configured)

### Playing Quizzes
1. Select a quiz source (OpenTDB, Trivia API, or Custom)
2. Choose difficulty level and category
3. Click "Start Quiz"
4. Answer questions using mouse or keyboard shortcuts
5. Use power-ups strategically
6. Review your results and learn from mistakes

### Creating Custom Quizzes
1. Go to the quiz selector
2. Click "Create Your Own Quiz"
3. Fill in quiz details (title, description, category, difficulty)
4. Add questions with multiple choice options
5. Mark the correct answer(s)
6. Save your quiz
7. Edit or delete quizzes from the quiz list

### Multiplayer Sessions
1. **Create a Session:**
   - Click "Multiplayer" from the main menu
   - Click "Create Session"
   - Configure quiz settings
   - Optionally check "Create as Public Session"
   - Share the session code with friends

2. **Join a Session:**
   - Click "Join Session"
   - Enter the 6-character session code
   - Or click "Join Random Game" to join a public session

3. **Invite Friends:**
   - In the lobby, click "Invite Friends"
   - Select friends from your friends list
   - Friends will receive invitations

### Friends System
1. **Add Friends:**
   - Go to Profile → Friends
   - Search for users by username or email
   - Send a friend request
   - Wait for acceptance

2. **Manage Friends:**
   - View your friends list
   - Click "Stats" to view friend statistics
   - Click "Remove" to remove a friend

### Email Verification
1. After registration, go to your Profile
2. Click "Request Verification Email"
3. Check your email inbox
4. Click the verification link
5. Your email will be verified

---

##  Keyboard Shortcuts

- **1-4**: Select answer options (1 = first option, 2 = second, etc.)
- **H**: Use hint
- **F**: Use 50/50 power-up (eliminate two wrong answers)
- **N**: Next question (when feedback is shown)
- **Enter**: Submit answer / Next question

---

##  Achievements

Unlock achievements by completing various challenges:

- **Getting Started** - Complete your first quiz
- **Perfectionist** - Get 100% on any quiz
- **Hot Streak** - Get a 5-question streak
- **Quiz Master** - Complete 50 quizzes
- **Speed Demon** - Complete a quiz in under 2 minutes
- **Night Owl** - Complete a quiz after 10 PM
- **Early Bird** - Complete a quiz before 8 AM
- **Category Expert** - Master a specific category
- And many more!

---

##  Troubleshooting

### Common Issues

1. **"Cannot connect to server"**
   - Make sure the server is running on port 4000
   - Check your `.env` file configuration

2. **"MongoDB connection error"**
   - Verify MongoDB is running
   - Check `MONGODB_URI` in `.env` file
   - Ensure MongoDB connection string is correct

3. **"Email verification not working"**
   - Email configuration is optional
   - If not configured, verification tokens will be shown in console/logs
   - Check email credentials in `.env` file

4. **"Token expired" or "No token provided"**
   - Log out and log back in
   - Clear browser localStorage if issues persist

5. **"Friend invitation not working"**
   - Ensure you're logged in
   - Check that you have friends added
   - Verify the session is in "WAITING" status

---

##  Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines
- Follow the existing code style
- Add comments for complex logic
- Test your changes thoroughly
- Update documentation if needed

---

##  License

This project is licensed under the MIT License.

---

##  Acknowledgments

- **OpenTDB** - Open Trivia Database for quiz questions
- **The Trivia API** - Additional trivia questions
- **React Community** - Amazing React ecosystem
- **Vite Team** - Fast build tool
- **MongoDB** - Database solution
- **Tailwind CSS** - Utility-first CSS framework

---

##  Authors

**QuizNerds** - Made by:
- Saeed Maiga
- Evan Boyle
- Simon Engman

---

##  Support

For issues, questions, or suggestions, please open an issue on GitHub.

---

## Hope you enjoy!
