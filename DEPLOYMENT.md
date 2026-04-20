# Deployment Guide: Workout Planner (Vercel + MongoDB Atlas)

## Prerequisites
1. A GitHub account
2. A Vercel account (linked to GitHub)
3. A MongoDB Atlas account

---

## Step 1: Database Setup (MongoDB Atlas)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free M0 cluster.
2. In **Database Access**, create a new database user and save the password.
3. In **Network Access**, click "Add IP Address" and select "Allow Access From Anywhere" (`0.0.0.0/0`). This is required for Vercel's dynamic IP addresses.
4. Click **Connect** on your cluster, choose "Connect your application", and copy the connection string. Replace `<password>` with your actual database user password.

---

## Step 2: Push to GitHub
1. Initialize git in your project root:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```
2. Create a new repository on GitHub.
3. Link and push your code:
   ```bash
   git remote add origin https://github.com/yourusername/workout-planner.git
   git push -u origin main
   ```

---

## Step 3: Deploy to Vercel
1. Log in to [Vercel](https://vercel.com/) and click **Add New... > Project**.
2. Import your newly created GitHub repository.
3. Under **Environment Variables**, add the following two variables:
   - Name: `MONGO_URI`
   - Value: `(Your MongoDB Atlas connection string from Step 1)`
   <br>
   - Name: `JWT_SECRET`
   - Value: `(A strong, random secret string used for signing tokens)`
4. Click **Deploy**.

---

## Step 4: Seed the Database
Before using the app, you need to populate the database with the initial 35 exercises. 

Since the app is now on Vercel, the easiest way is to run the seed script locally, but connect it to your production database.

1. In your local project folder, create a `.env` file (copy from `.env.example`).
2. Add your production `MONGO_URI` to this `.env` file.
3. Open your terminal in the project root and run:
   ```bash
   npm install
   npm run seed
   ```
4. You should see `✅ Seeded 35 exercises successfully`.

---

## Step 5: Test the Application
1. Go to the URL provided by Vercel (e.g., `https://workout-planner-xxx.vercel.app`).
2. Create a new account on the landing page.
3. Create a new Workout Plan, making sure the exercise library successfully loads.
4. Log a workout to ensure everything saves to the database correctly.
