import React, { useState } from 'react';
import {
  Layers,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Terminal,
  Database,
  Cpu,
  Globe,
  FileCode,
  Copy,
  Check,
} from 'lucide-react';

export const MernArchitecturePage: React.FC = () => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const steps = [
    {
      step: '1. React Frontend UI (State & User Input)',
      direction: 'down',
      component: 'client/src/pages/CreateBlogPage.jsx',
      icon: Globe,
      desc: 'The author enters a Title and Content in the React component. A form submit event triggers a handler which prepares a FormData payload or JSON object with the user inputs and cover image file.',
      snippet: `// In React Component (CreateBlogPage.jsx)
const handleSubmit = async (e) => {
  e.preventDefault();
  const formData = new FormData();
  formData.append('title', title);
  formData.append('content', content);
  formData.append('category', category);
  
  // Hand off to our API client service
  await blogsAPI.createBlog(formData);
};`,
    },
    {
      step: '2. Fetch / HTTP Client (Network Request)',
      direction: 'down',
      component: 'client/src/services/api.js',
      icon: FileCode,
      desc: 'The frontend API service adds the JWT authentication header (Bearer <token>) retrieved from localStorage and sends an asynchronous HTTP POST request to http://localhost:5000/api/blogs.',
      snippet: `// In API Client (api.js)
const response = await fetch('/api/blogs', {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer \${localStorage.getItem('token')}\`
  },
  body: formData
});
const data = await response.json();`,
    },
    {
      step: '3. Express Routing & Middleware (Authentication & Multer)',
      direction: 'down',
      component: 'server/routes/blogRoutes.js',
      icon: Cpu,
      desc: 'Express matches the POST /api/blogs endpoint. It first runs the protect middleware (which verifies the JWT signature and extracts user ID), then runs the Multer diskStorage middleware (which saves the cover image file locally to server/uploads/), and finally routes to the controller.',
      snippet: `// In Express Router (blogRoutes.js)
router.post(
  '/',
  protect,                     // 1. Decodes JWT token
  upload.single('coverImage'), // 2. Saves image to server/uploads/
  createBlog                   // 3. Invokes controller function
);`,
    },
    {
      step: '4. Controller Logic (Validation & Business Rules)',
      direction: 'down',
      component: 'server/controllers/blogController.js',
      icon: Terminal,
      desc: 'The controller function receives req.body, req.user, and req.file. It validates that required fields are present, prepares the data dictionary, and calls the Mongoose model.',
      snippet: `// In Blog Controller (blogController.js)
export const createBlog = async (req, res) => {
  const { title, content, category, tags, status } = req.body;
  const coverImagePath = req.file ? \`/uploads/\${req.file.filename}\` : '';

  const newBlog = await Blog.create({
    title,
    content,
    author: req.user._id, // User ID from decoded JWT
    category,
    coverImage: coverImagePath,
    status
  });

  return res.status(201).json({ success: true, blog: newBlog });
};`,
    },
    {
      step: '5. Mongoose ODM Schema & Query Compiler',
      direction: 'down',
      component: 'server/models/Blog.js',
      icon: Database,
      desc: 'Mongoose schema validates data types, casts string IDs to MongoDB ObjectId types, sets default timestamps, and serializes the document into the binary JSON (BSON) protocol.',
      snippet: `// In Mongoose Schema (Blog.js)
const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: { type: String, enum: ['draft', 'published'], default: 'published' }
}, { timestamps: true });`,
    },
    {
      step: '6. Local MongoDB Community Server Storage',
      direction: 'down',
      component: 'mongodb://127.0.0.1:27017/blog_platform',
      icon: Database,
      desc: 'MongoDB Community Server running as a local background daemon accepts the BSON insert, writes the document to the collection on disk, updates the text indexes, and returns an acknowledgment containing the new generated _id.',
      snippet: `// In MongoDB Engine (localhost:27017)
db.blogs.insertOne({
  "_id": ObjectId("6603a1b2c3d4e5f678901301"),
  "title": "The Art of the Monolith",
  "author": ObjectId("6601a1b2c3d4e5f678901235"),
  "coverImage": "/uploads/cover_174123456.jpg",
  "status": "published",
  "createdAt": ISODate("2026-10-03T10:00:00Z")
});`,
    },
    {
      step: '7. The Return Journey: MongoDB → Mongoose → Express → React',
      direction: 'up',
      component: 'Full Stack Response Pipeline',
      icon: CheckCircle2,
      desc: 'The flow travels back: MongoDB returns the written document to Mongoose -> Mongoose wraps it in a JavaScript object -> Express sends HTTP 201 JSON response -> React receives the JSON data in state -> React re-renders the UI instantly!',
      snippet: `// Back in React (HomePage / BlogDetailPage)
// UI updates seamlessly with the newly created article:
<BlogCard blog={newBlog} />`,
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-10 text-center max-w-2xl mx-auto">
        <span className="text-xs uppercase font-mono tracking-wider text-stone-500 font-semibold">
          Pedagogical Architecture
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-900 mt-2 mb-4">
          The Full-Stack MERN Lifecycle
        </h1>
        <p className="text-sm text-stone-600 leading-relaxed">
          Follow the exact, transparent request-and-response journey from a button click in React to
          byte storage in local MongoDB and back to the user interface.
        </p>
      </div>

      {/* Step by Step Flow Cards */}
      <div className="space-y-6 relative mb-16">
        {steps.map((s, index) => {
          const Icon = s.icon;
          return (
            <div
              key={index}
              className="bg-white border border-stone-200/90 rounded-2xl p-6 shadow-xs relative"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-stone-900 text-stone-100 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="font-serif text-lg font-bold text-stone-900">{s.step}</h2>
                    <span className="text-xs text-stone-500 font-mono">{s.component}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => copyToClipboard(s.snippet, index)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-stone-600 border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors self-start"
                >
                  {copiedIndex === index ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mb-4">
                {s.desc}
              </p>

              {/* Code Snippet Box */}
              <div className="bg-stone-950 text-stone-200 rounded-xl p-4 overflow-x-auto text-xs font-mono">
                <pre>{s.snippet}</pre>
              </div>

              {/* Connecting arrow if not last */}
              {index < steps.length - 1 && (
                <div className="flex justify-center -mb-8 mt-2 relative z-10">
                  <div className="w-7 h-7 rounded-full bg-stone-100 border border-stone-300 text-stone-600 flex items-center justify-center shadow-xs">
                    <ArrowDown className="w-3.5 h-3.5" />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Localhost Setup Checklist (README Reference) */}
      <section id="local-setup" className="bg-stone-900 text-stone-100 rounded-2xl p-8 sm:p-10 border border-stone-800">
        <div className="mb-6">
          <span className="text-xs uppercase font-mono tracking-wider text-amber-400 font-semibold">
            Local Computer Deployment
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-50 mt-1">
            Running on Your Local Machine
          </h2>
          <p className="text-xs sm:text-sm text-stone-300 mt-1">
            Standard setup instructions for your terminal:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-stone-300">
          <div className="space-y-3 bg-stone-950/70 p-5 rounded-xl border border-stone-800">
            <h3 className="font-mono font-bold text-stone-100 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              1. Start Local MongoDB
            </h3>
            <p className="text-stone-400">
              Ensure MongoDB Community Server is installed and started on port 27017:
            </p>
            <div className="bg-stone-900 p-2.5 rounded font-mono text-[11px] text-emerald-300">
              mongod --dbpath ~/data/db
            </div>
          </div>

          <div className="space-y-3 bg-stone-950/70 p-5 rounded-xl border border-stone-800">
            <h3 className="font-mono font-bold text-stone-100 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              2. Start Express Backend
            </h3>
            <p className="text-stone-400">
              Navigate to server folder and install dependencies:
            </p>
            <div className="bg-stone-900 p-2.5 rounded font-mono text-[11px] text-emerald-300">
              cd server && npm install && npm run dev
            </div>
          </div>

          <div className="space-y-3 bg-stone-950/70 p-5 rounded-xl border border-stone-800">
            <h3 className="font-mono font-bold text-stone-100 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              3. Start React Frontend
            </h3>
            <p className="text-stone-400">
              Navigate to client folder and launch Vite:
            </p>
            <div className="bg-stone-900 p-2.5 rounded font-mono text-[11px] text-emerald-300">
              cd client && npm install && npm run dev
            </div>
          </div>

          <div className="space-y-3 bg-stone-950/70 p-5 rounded-xl border border-stone-800">
            <h3 className="font-mono font-bold text-stone-100 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-400" />
              4. Seed Accounts Ready
            </h3>
            <p className="text-stone-400">
              Pre-configured test accounts are ready to sign in:
            </p>
            <ul className="space-y-1 font-mono text-[11px] text-stone-300">
              <li>• Admin: admin@example.com / admin123</li>
              <li>• Author: author@example.com / author123</li>
              <li>• Reader: user@example.com / user123</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};
