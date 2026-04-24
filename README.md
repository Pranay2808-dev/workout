# FitPlan: Customizable Workout Planner

FitPlan is a comprehensive full-stack web application designed to help users generate customizable workout plans, log their exercise progress, and manage their fitness journeys.

## Features

- **User Authentication**: Secure signup and login using JSON Web Tokens (JWT) and bcrypt password hashing.
- **Dynamic Workout Generator**: Create custom workout routines based on specific fitness goals (hypertrophy, strength, endurance), experience levels, and available equipment.
- **Interactive Dashboard**: View active workout plans, recent activity, and overall progress at a glance.
- **Workout Logging**: Track your daily workouts including sets, reps, and weights for each exercise to monitor progressive overload.
- **Saved Plans Library**: Manage and review all your previously generated and saved workout routines.
- **Profile Management**: Update user details and fitness preferences.
- **Responsive Design**: Modern and vibrant UI that works seamlessly across desktop and mobile devices.

## Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT (JSON Web Tokens)
- **Deployment**: Vercel

## Project Structure

```
workout-planner/
├── backend/
│   ├── config/       # Database configuration
│   ├── middleware/   # Authentication & Rate limiting middleware
│   ├── models/       # Mongoose schemas (User, Plan, Log, Exercise)
│   ├── routes/       # API endpoints
│   ├── seed/         # Database seeding scripts
│   └── server.js     # Entry point for the Express backend
├── frontend/
│   ├── css/          # Stylesheets
│   ├── js/           # Frontend logic and API integration
│   └── *.html        # UI Views (index, dashboard, generator, etc.)
└── package.json
```

## Local Development Setup

### Prerequisites
- Node.js installed
- A MongoDB instance (local or MongoDB Atlas)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Pranay2808-dev/workout.git
   cd workout
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the root directory and add the following variables (refer to `.env.example`):
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   ```

4. **Seed the Database**
   Populate the database with the initial set of exercises:
   ```bash
   npm run seed
   ```

5. **Start the Development Server**
   ```bash
   npm run dev
   ```

6. **Access the Application**
   Open your browser and navigate to `http://localhost:5000` (or whichever port you specified).

## API Endpoints

- **Auth Routes**: `/api/auth/register`, `/api/auth/login`, `/api/auth/me`
- **Exercise Routes**: `/api/exercises` (GET all, seed)
- **Plan Routes**: `/api/plans` (Generate, GET all, GET specific, DELETE)
- **Log Routes**: `/api/logs` (Create log, GET history)

## Deployment

The application is configured to be deployed on Vercel. For detailed deployment instructions, including setting up MongoDB Atlas and configuring Vercel environment variables, please refer to the [DEPLOYMENT.md](DEPLOYMENT.md) guide.

## License

This project is licensed under the MIT License.
