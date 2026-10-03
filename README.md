# Ink & Quill — Full-Stack MERN Editorial & CMS Platform

A complete, production-grade **Blogging and Content Management Platform built strictly with the MERN stack** (MongoDB Community Server, Express.js, React.js, Node.js).

Designed to run **100% locally on your machine** with zero external cloud dependencies, zero external APIs, and zero tracking.

---

## 🏛️ Project Architecture & Structure

```
blog-platform/
│
├── client/                     # React Frontend (Vite, React Router, Tailwind CSS)
│   ├── src/
│   │   ├── components/         # Navbar, Footer, BlogCard, CategoryFilter, Comments
│   │   ├── pages/              # Home, Blogs, Detail, Create, Edit, Bookmarks, Profile, Dashboards
│   │   ├── context/            # AuthContext (JWT, user state, auto-login)
│   │   ├── services/           # api.js (Fetch HTTP client with Bearer headers)
│   │   ├── App.jsx             # React Router configuration & route guards
│   │   └── main.jsx            # React root entry point
│   ├── public/                 # Static assets
│   ├── vite.config.js          # Vite configuration with Express proxy
│   ├── package.json            # Frontend dependencies
│   └── index.html              # HTML shell with Google Fonts typography
│
├── server/                     # Express Backend & Mongoose
│   ├── controllers/            # authController, blogController, categoryController, commentController
│   ├── models/                 # User, Blog, Category, Comment, Bookmark (Mongoose Schemas)
│   ├── routes/                 # authRoutes, blogRoutes, categoryRoutes, commentRoutes, adminRoutes
│   ├── middleware/             # auth.js (JWT protect & admin), upload.js (Multer disk storage)
│   ├── uploads/                # Local cover image files stored on disk
│   ├── config/                 # db.js (Local MongoDB connection handler)
│   ├── server.js               # Standalone Express backend server (port 5000)
│   └── package.json            # Backend dependencies
│
├── .env.example                # Environment variables template
├── .gitignore                  # Git ignore rules (node_modules, .env, uploads)
└── README.md                   # Full documentation & setup guide
```

---

## 🌊 Understanding the MERN Data Flow

Every action in this application follows a strict, beginner-friendly request-response flow:

```
[1. React Client]
  User enters title & image -> React State -> blogsAPI.createBlog(formData)
       ↓
[2. HTTP Network Request]
  Browser issues POST http://localhost:5000/api/blogs with Authorization: Bearer <token>
       ↓
[3. Express Middleware]
  protect middleware verifies JWT signature -> extracts user ID
  upload middleware saves cover image to server/uploads/ using Multer
       ↓
[4. Controller]
  blogController.js receives req.body, req.user, req.file -> validates input
       ↓
[5. Mongoose ODM]
  Blog.create({ title, content, author, coverImage, ... }) casts ObjectIds and validates schema
       ↓
[6. Local MongoDB Community Server]
  mongodb://127.0.0.1:27017/blog_platform receives BSON payload and writes document to disk
       ↓
[7. Return Journey]
  MongoDB returns saved document -> Mongoose -> Express JSON (201) -> React State -> UI Re-renders!
```

---

## 🚀 Complete Localhost Setup Guide

Follow these 13 step-by-step instructions to run the application entirely on your local computer:

### 1. How to Install Node.js
- Download and install **Node.js LTS (v18, v20, or v22)** from [https://nodejs.org](https://nodejs.org).
- Verify the installation in your terminal:
  ```bash
  node -v
  npm -v
  ```

### 2. How to Install MongoDB Community Server
- Download **MongoDB Community Edition** for your operating system:
  - **macOS (Homebrew)**:
    ```bash
    brew tap mongodb/brew
    brew install mongodb-community@7.0
    ```
  - **Windows**: Download the `.msi` installer from [MongoDB Download Center](https://www.mongodb.com/try/download/community) and follow the Setup Wizard.
  - **Linux (Ubuntu/Debian)**:
    ```bash
    sudo apt-get install -y mongodb-org
    ```

### 3. How to Start MongoDB Locally
- Start the MongoDB Community service:
  - **macOS (Homebrew)**:
    ```bash
    brew services start mongodb/brew/mongodb-community
    ```
  - **Linux / systemd**:
    ```bash
    sudo systemctl start mongod
    sudo systemctl status mongod
    ```
  - **Direct Terminal Daemon**:
    ```bash
    mkdir -p ~/data/db
    mongod --dbpath ~/data/db
    ```
- Your MongoDB instance is now listening at: `mongodb://127.0.0.1:27017/blog_platform`.

### 4. How to Navigate into the Project
Open two terminal windows:
- **Terminal 1**: for the backend server (`cd server`)
- **Terminal 2**: for the frontend client (`cd client`)

### 5. How to Install Dependencies
In Terminal 1 (Backend):
```bash
cd server
npm install
```

In Terminal 2 (Frontend):
```bash
cd client
npm install
```

### 6. How to Configure `.env`
In the root directory or inside `server/`, create a `.env` file from `.env.example`:
```bash
cp .env.example .env
```
Inside `.env`:
```env
MONGO_URI=mongodb://127.0.0.1:27017/blog_platform
JWT_SECRET=mern_blog_platform_super_secret_jwt_key_2026
PORT=5000
```

### 7. How to Start the Backend Server
In Terminal 1 (`server/` directory):
```bash
npm run dev
```
You will see:
```
=========================================
🚀 Ink & Quill MERN Server is running!
📡 URL: http://localhost:5000
📁 Uploads served at: http://localhost:5000/uploads
[Database] ✓ Connected to local MongoDB instance
=========================================
```

### 8. How to Start the React Frontend
In Terminal 2 (`client/` directory):
```bash
npm run dev
```
Open your browser and navigate to:
```
http://localhost:5173
```

---

## 👥 Testing & Application Walkthrough

### 9. How to Create an Admin Account
The platform automatically seeds an initial Admin and Author account. You can log in immediately using:
- **Email**: `admin@example.com`
- **Password**: `admin123`

Or create a new account via the UI `/register` and promote it to Admin in the Admin Console or directly in MongoDB:
```javascript
// In mongosh:
use blog_platform
db.users.updateOne({ email: "your_email@example.com" }, { $set: { role: "admin" } })
```

### 10. How to Register a Normal User
1. Click **Register** in the top navigation bar.
2. Fill out **Full Name**, **Email**, **Password**, and **Confirm Password**.
3. Passwords are automatically hashed with `bcryptjs` (salt factor 10) before being stored.
4. You are automatically signed in with a signed JWT token stored in your browser's `localStorage`.

### 11. How to Create a Blog
1. Click the **Write** button in the navigation bar (`/create-blog`).
2. Provide:
   - **Title**: e.g., "Designing Monolithic Systems in Node.js"
   - **Category**: Select from Technology, Programming, AI, Web Dev, UI/UX, Lifestyle.
   - **Tags**: Comma-separated tags (e.g. `architecture, node, express`).
   - **Cover Image**: Upload any JPG, PNG, or WebP file. **Multer** saves the image to `server/uploads/` on your local hard drive.
   - **Article Body**: Supports headings (`##`), bold text, lists, and drop caps.
   - Toggle between **Editor** and **Live Preview** to check formatting.

### 12. How to Save a Draft vs. Publish a Blog
- **Save as Draft**: Select "Save as Draft" or click "Save Draft". Drafts are strictly private and only visible to you in your **Author Dashboard** (`/author/dashboard`).
- **Publish Immediately**: Publicly indexes the article on the Home page and Articles catalogue.

### 13. How to Test Comments, Likes, and Bookmarks
- **Likes**: On any blog card or detail page, click the **Heart** button. Notice that duplicate likes are prevented by checking user ObjectId in the Mongoose array.
- **Bookmarks**: Click the **Bookmark** button. Visit **Bookmarks** (`/bookmarks`) from the navbar to view your curated reading list.
- **Comments**: Open any article, scroll to **Discussions**, type a comment, and click **Post Comment**. Comment authors can delete their own comments; administrators can delete any comment.

---

## 🔐 Security & Best Practices Implemented

- **Password Security**: Passwords hashed using `bcryptjs`. Plain text passwords are never stored or returned.
- **Stateless Authentication**: Signed `jsonwebtoken` (JWT) containing user ID with 7-day expiration.
- **Ownership Verification**: Users can only edit and delete their own articles and comments.
- **Role-Based Authorization Middleware**: Admin routes (`/api/admin/*`) require `protect` and `admin` middleware checks.
- **Local Storage Isolation**: Files are stored in `server/uploads/` with UUID-based unique filenames, served statically by Express without cloud buckets.
