# QuizNerds 🧠

A modern, feature-rich quiz application built with React and Node.js. QuizNerds offers an engaging quiz experience with advanced features like achievements, daily challenges, power-ups, and custom quiz creation.

## ✨ Features

### 🎯 Core Quiz Features
- **Multiple Question Sources**: OpenTDB, Trivia API, and custom quizzes
- **Difficulty Levels**: Easy, Medium, Hard
- **Categories**: Science, History, Geography, Entertainment, and more
- **Timer**: Countdown timer for each question
- **Progress Tracking**: Visual progress bar and completion percentage

### 🏆 Gamification
- **Achievement System**: 12+ achievements with different rarities
- **XP & Leveling**: Progressive leveling system with titles
- **Daily Challenges**: Special themed quizzes with rewards
- **Streak Tracking**: Maintain streaks for bonus rewards
- **Power-ups**: Skip, Extra Time, Double Points, Reveal Answer

### 🎨 Modern UI/UX
- **Glassmorphism Design**: Modern glass-like effects
- **Dark/Light Themes**: Toggle between themes
- **Responsive Layout**: Works on all devices
- **Smooth Animations**: Engaging micro-interactions
- **Sound Effects**: Audio feedback for actions

### 📚 Learning Features
- **Learning Mode**: Explanations for wrong answers
- **Answer Review**: Detailed review of all answers
- **Custom Quiz Creation**: Create and share your own quizzes
- **Statistics Tracking**: Performance analytics and history

### 🔧 Technical Features
- **Authentication**: Secure login with Auth0
- **Persistent Storage**: Local storage for progress and settings
- **Real-time Updates**: Live score and progress tracking
- **Keyboard Shortcuts**: Quick navigation with hotkeys

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MongoDB (for server)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd quiznerds
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install client dependencies
   cd client
   npm install
   
   # Install server dependencies
   cd ../server
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Create .env file in server directory
   cd server
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start the application**
   ```bash
   # Start server (from server directory)
   npm start
   
   # Start client (from client directory)
   npm run dev
   ```

## 🎮 Usage

1. **Login**: Use Auth0 authentication to access the platform
2. **Choose Quiz**: Select from standard quizzes or daily challenges
3. **Play**: Answer questions with optional power-ups and hints
4. **Learn**: Review incorrect answers with explanations
5. **Create**: Build custom quizzes and share with others
6. **Track**: Monitor your progress and achievements

## 🛠️ Technology Stack

### Frontend
- **React 19**: Modern React with latest features
- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **Auth0**: Authentication and authorization

### Backend
- **Node.js**: JavaScript runtime
- **Express**: Web framework
- **MongoDB**: Database with Mongoose ODM
- **Helmet**: Security middleware

### Features
- **React Confetti**: Celebration animations
- **Local Storage**: Client-side data persistence
- **Responsive Design**: Mobile-first approach

## 📱 Keyboard Shortcuts

- **1-4**: Select answer options
- **H**: Use hint
- **F**: Use 50/50 power-up
- **N**: Next question (when feedback is shown)

## 🎯 Achievements

- **Getting Started**: Complete your first quiz
- **Perfectionist**: Get 100% on any quiz
- **Hot Streak**: Get a 5-question streak
- **Quiz Master**: Complete 50 quizzes
- **Speed Demon**: Complete a quiz in under 2 minutes
- And many more!

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- OpenTDB for question database
- The Trivia API for additional questions
- Auth0 for authentication services
- React and Vite communities

---

**QuizNerds** - Where knowledge meets fun! 🧠✨
