# ExamPro – Online Examination System

## About the Project

ExamPro is a full-stack online examination system that I developed using the MERN stack.

The main idea behind this project is to make the examination process easier for both students and administrators. Instead of managing exams manually, admins can create exams, add questions, manage students, and check results through the application.

Students can log in, view available exams, attend them online, and check their results.

I also implemented a Forgot Password feature that allows users to reset their passwords through an email link.

## Features

### Admin
- Admin login and dashboard.
- View and manage student details.
- Create and manage exams.
- Add and manage questions.
- Upload MCQ questions using PDF files.
- Maintain a question bank.
- Approve and assign questions to exams.
- View student examination results.

### Student
- Student registration and login.
- Student dashboard.
- View available exams.
- Read exam instructions before starting.
- Attend exams online.
- Countdown timer during the exam.
- Automatic submission when the timer reaches zero.
- View exam results.

### Authentication
- Login and registration.
- Separate access for Admin and Student.
- Forgot Password option.
- Password reset through email.
- Password hashing for security.

## Technologies Used

- **Frontend:** React.js, Vite, Bootstrap 5
- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas
- **API:** Axios
- **Routing:** React Router DOM
- **Email:** Nodemailer
- **Authentication:** JWT and bcrypt
- **File Handling:** Multer and PDF parsing
- **Version Control:** Git and GitHub

## Project Structure

```text
ONLINE EXAMINATION SYSTEM/
│
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── .env
│   └── package.json
│
├── public/
├── src/
│   ├── components/
│   ├── pages/
│   ├── context/
│   └── assets/
│
├── package.json
├── .gitignore
└── README.md
```

## How to Run the Project

### Step 1: Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

### Step 2: Open the Project

```bash
cd "ONLINE EXAMINATION SYSTEM"
```

### Step 3: Install Frontend Packages

```bash
npm install
```

### Step 4: Install Backend Packages

```bash
cd backend
npm install
```

### Step 5: Configure Environment Variables

Create a `.env` file inside the backend folder.

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
EMAIL_USER=your_email
EMAIL_PASS=your_gmail_app_password
CLIENT_URL=http://localhost:5173
```

Add your own credentials. Do not upload the `.env` file to GitHub.

### Step 6: Start the Backend

Run the backend start command configured in `backend/package.json`.

### Step 7: Start the Frontend

Open another terminal in the main project folder and run:

```bash
npm run dev
```

Open the local URL shown in the terminal.

## How the Application Works

1. Students and admins log in to the application.
2. Admin creates exams and manages questions.
3. Students can see the exams assigned to them.
4. Students start the exam after reading the instructions.
5. They answer questions within the given time.
6. After submission, they can check their results.

## Future Improvements

- Better exam monitoring.
- More detailed student performance reports.
- Improved exam security.
- Additional analytics for administrators.

## Project Details

**Project Name:** ExamPro – Online Examination System

**Project Type:** MERN Stack Full-Stack Project

**Database:** MongoDB Atlas

**Status:** Developed; further improvements are possible.