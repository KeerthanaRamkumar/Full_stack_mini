import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Blog from '../models/Blog.js';
import Category from '../models/Category.js';
import Comment from '../models/Comment.js';
import Bookmark from '../models/Bookmark.js';
import { getDbStatus } from '../config/db.js';

const DATA_DIR = path.resolve(process.cwd(), 'server', 'data');
const DB_FILE = path.join(DATA_DIR, 'local_db.json');

// Helper to generate 24-character hexadecimal ObjectId compatible with MongoDB
export const generateObjectId = () => {
  return crypto.randomBytes(12).toString('hex');
};

// Initial Seed Data generator
const getSeedData = () => {
  const adminId = '6601a1b2c3d4e5f678901234';
  const authorId = '6601a1b2c3d4e5f678901235';
  const userId = '6601a1b2c3d4e5f678901236';

  const catTechId = '6602a1b2c3d4e5f678901201';
  const catProgId = '6602a1b2c3d4e5f678901202';
  const catAiId = '6602a1b2c3d4e5f678901203';
  const catWebId = '6602a1b2c3d4e5f678901204';
  const catUiId = '6602a1b2c3d4e5f678901205';
  const catEduId = '6602a1b2c3d4e5f678901206';
  const catLifeId = '6602a1b2c3d4e5f678901207';

  const blog1Id = '6603a1b2c3d4e5f678901301';
  const blog2Id = '6603a1b2c3d4e5f678901302';
  const blog3Id = '6603a1b2c3d4e5f678901303';
  const blog4Id = '6603a1b2c3d4e5f678901304';
  const blog5Id = '6603a1b2c3d4e5f678901305';

  const salt = bcrypt.genSaltSync(10);
  const adminPasswordHash = bcrypt.hashSync('admin123', salt);
  const authorPasswordHash = bcrypt.hashSync('author123', salt);
  const userPasswordHash = bcrypt.hashSync('user123', salt);

  return {
    users: [
      {
        _id: adminId,
        name: 'Eleanor Vance',
        email: 'admin@example.com',
        password: adminPasswordHash,
        role: 'admin',
        profileImage: '/uploads/avatar_editorial_author_1791021230534.jpg',
        bio: 'Editor-in-chief & administrator. Writing about thoughtful engineering and editorial systems.',
        createdAt: new Date('2026-01-15T09:00:00Z').toISOString(),
      },
      {
        _id: authorId,
        name: 'Julian Thorne',
        email: 'author@example.com',
        password: authorPasswordHash,
        role: 'user',
        profileImage: '/uploads/avatar_editorial_author_1791021230534.jpg',
        bio: 'Staff essayist and full-stack software engineer. Obsessed with readable prose and high-performance databases.',
        createdAt: new Date('2026-02-01T10:30:00Z').toISOString(),
      },
      {
        _id: userId,
        name: 'Keerthana R.',
        email: 'user@example.com',
        password: userPasswordHash,
        role: 'user',
        profileImage: '',
        bio: 'Lifelong learner exploring the modern MERN stack and clean web architectures.',
        createdAt: new Date('2026-02-14T14:20:00Z').toISOString(),
      },
    ],
    categories: [
      { _id: catTechId, name: 'Technology', description: 'Computing trends, architecture, and system hardware.', createdAt: new Date('2026-01-01').toISOString() },
      { _id: catProgId, name: 'Programming', description: 'JavaScript, TypeScript, Node.js, and clean code techniques.', createdAt: new Date('2026-01-01').toISOString() },
      { _id: catAiId, name: 'Artificial Intelligence', description: 'Autonomous agents, neural architectures, and intelligent systems.', createdAt: new Date('2026-01-01').toISOString() },
      { _id: catWebId, name: 'Web Development', description: 'React, Express, REST APIs, and full-stack engineering.', createdAt: new Date('2026-01-01').toISOString() },
      { _id: catUiId, name: 'UI/UX', description: 'Typography, layout math, accessibility, and visual hierarchy.', createdAt: new Date('2026-01-01').toISOString() },
      { _id: catEduId, name: 'Education', description: 'Curriculum design, developer onboarding, and mentorship.', createdAt: new Date('2026-01-01').toISOString() },
      { _id: catLifeId, name: 'Lifestyle', description: 'Mindful productivity, slow writing, and focus rituals.', createdAt: new Date('2026-01-01').toISOString() },
    ],
    blogs: [
      {
        _id: blog1Id,
        title: 'The Art of the Monolith: Why Boring Tech Wins',
        content: `Software engineering often falls victim to the sirens of artificial complexity. We dismantle modular codebases into dozens of brittle microservices before finding product-market fit, only to spend our working hours orchestrating distributed transactions and debugging network latency.\n\nIn this long-form reflection, we explore the enduring power of unified web services: Node.js, Express, and local databases. When built with discipline, a single repository and coherent data model can serve millions of requests with sub-millisecond query performance and zero operational overhead.\n\n### The Illusion of Premature Scaling\nMost architectural bottlenecks are not solved by introducing network boundaries between your functions. They are solved by indexing your queries, caching high-read records, and preserving clear code boundaries inside the application container.\n\n### Simplicity as an Explicit Feature\nChoosing proven tools like Express and MongoDB gives your team something invaluable: cognitive clarity. Every developer understands where data lives, how requests are validated, and how to debug a failing route without needing an observability cluster. Embrace the craft of simplicity.`,
        author: authorId,
        category: catTechId,
        categoryName: 'Technology',
        tags: ['Architecture', 'Node.js', 'Engineering'],
        coverImage: '/uploads/hero_editorial_workspace_1791021169224.jpg',
        status: 'published',
        likes: [adminId, userId],
        createdAt: new Date('2026-02-18T11:00:00Z').toISOString(),
        updatedAt: new Date('2026-02-18T11:00:00Z').toISOString(),
      },
      {
        _id: blog2Id,
        title: 'Deep Work and the Morning Writing Ritual',
        content: `Before the screen lights up with notifications and message pings, the morning holds a quiet sanctuary. For writers and engineers alike, cultivating an undisturbed block of time is the prerequisite for deep intellectual output.\n\nSetting aside sixty minutes at sunrise with an open notebook or a clean markdown document allows ideas to crystallize without distraction. You are not reacting to the world; you are initiating a dialogue with your own intellect.\n\n### Designing the Ritual\n1. Disconnect all communication channels before sleeping.\n2. Keep your desk uncluttered—only your pen, journal, or text editor.\n3. Write the hardest paragraph first.\n\nThe quality of your thinking directly mirrors the quality of your attention. Protect it fiercely.`,
        author: adminId,
        category: catLifeId,
        categoryName: 'Lifestyle',
        tags: ['Productivity', 'Rituals', 'Writing'],
        coverImage: '/uploads/blog_lifestyle_tea_1791021203342.jpg',
        status: 'published',
        likes: [authorId],
        createdAt: new Date('2026-02-22T08:30:00Z').toISOString(),
        updatedAt: new Date('2026-02-22T08:30:00Z').toISOString(),
      },
      {
        _id: blog3Id,
        title: 'Modern Typography: Rhythm, Contrast, and Restraint',
        content: `Digital typography is not merely about selecting an appealing font family. It is an architectural discipline governed by geometry, visual rhythm, and reading ergonomics.\n\nWhen we look at historical book design from the renaissance through mid-century modernism, the masters relied on a limited typographic palette: a distinguished serif for literary cadence, a neutral sans-serif for clarity, and strict typographic hierarchy.\n\n### The Golden Rules of Editorial Web Design\n- Never wrap simple metadata into candy pill capsules.\n- Constrain reading line lengths to 65–75 characters per measure.\n- Establish contrast through optical size and line-height, not garish rainbow colors.\n\nWhen readers open your article, typography should quietly guide the eye without shouting for attention.`,
        author: authorId,
        category: catUiId,
        categoryName: 'UI/UX',
        tags: ['Design', 'Typography', 'Editorial'],
        coverImage: '/uploads/blog_design_craft_1791021191503.jpg',
        status: 'published',
        likes: [userId],
        createdAt: new Date('2026-02-28T14:15:00Z').toISOString(),
        updatedAt: new Date('2026-02-28T14:15:00Z').toISOString(),
      },
      {
        _id: blog4Id,
        title: 'Understanding MERN Stack Data Flow: From React to MongoDB',
        content: `To truly master full-stack JavaScript, you must build an intuition for the complete request-response journey across all four tiers of the MERN stack.\n\n### 1. The Client (React)\nA user types a title and clicks 'Publish'. React captures the input in state and issues an HTTP POST request using fetch or Axios, attaching the JWT bearer token in the headers.\n\n### 2. The Server (Express)\nThe request hits Express routing middleware. The authentication middleware verifies the cryptographic signature of the JWT token, extracts the user ID, and passes execution to the controller.\n\n### 3. The Controller & Model (Mongoose)\nThe controller validates incoming fields and constructs a Mongoose document. Mongoose casts data types and sends the serialized BSON command to the database socket.\n\n### 4. The Database (MongoDB)\nMongoDB Community Server writes the document to disk, updates indexes, and returns the generated document. The response flows all the way back to React to render the updated UI.\n\nDemystifying this cycle turns intimidating full-stack development into predictable, empowering engineering.`,
        author: authorId,
        category: catWebId,
        categoryName: 'Web Development',
        tags: ['React', 'Node.js', 'Express', 'MongoDB'],
        coverImage: '/uploads/blog_tech_future_1791021180515.jpg',
        status: 'published',
        likes: [adminId, authorId, userId],
        createdAt: new Date('2026-03-01T16:00:00Z').toISOString(),
        updatedAt: new Date('2026-03-01T16:00:00Z').toISOString(),
      },
      {
        _id: blog5Id,
        title: 'Draft: The Future of Offline-First Web Architectures',
        content: `Work in progress exploring how modern browsers and local-first databases change user expectations around connectivity and data ownership. Notes on CRDTs and local storage engines.`,
        author: authorId,
        category: catProgId,
        categoryName: 'Programming',
        tags: ['Offline', 'LocalFirst', 'Draft'],
        coverImage: '',
        status: 'draft',
        likes: [],
        createdAt: new Date('2026-03-02T10:00:00Z').toISOString(),
        updatedAt: new Date('2026-03-02T10:00:00Z').toISOString(),
      },
    ],
    comments: [
      {
        _id: '6604a1b2c3d4e5f678901401',
        blog: blog1Id,
        user: userId,
        text: 'This article resonated deeply. Too many tutorials jump straight to microservices without learning how powerful a clean Express and MongoDB setup really is.',
        createdAt: new Date('2026-02-19T09:30:00Z').toISOString(),
      },
      {
        _id: '6604a1b2c3d4e5f678901402',
        blog: blog1Id,
        user: adminId,
        text: 'Magnificent synthesis, Julian. Clean architecture always outlives passing trends.',
        createdAt: new Date('2026-02-20T12:00:00Z').toISOString(),
      },
      {
        _id: '6604a1b2c3d4e5f678901403',
        blog: blog4Id,
        user: userId,
        text: 'The step-by-step breakdown of the 4 tiers is the clearest explanation I have read this year!',
        createdAt: new Date('2026-03-01T18:45:00Z').toISOString(),
      },
    ],
    bookmarks: [
      {
        _id: '6605a1b2c3d4e5f678901501',
        user: userId,
        blog: blog1Id,
        createdAt: new Date('2026-02-20T10:00:00Z').toISOString(),
      },
      {
        _id: '6605a1b2c3d4e5f678901502',
        user: userId,
        blog: blog4Id,
        createdAt: new Date('2026-03-01T19:00:00Z').toISOString(),
      },
    ],
  };
};

// Ensure data folder exists
const initLocalDb = () => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    const seed = getSeedData();
    fs.writeFileSync(DB_FILE, JSON.stringify(seed, null, 2), 'utf-8');
    console.log('[Database] Seeded initial data in local file store.');
  }
};

initLocalDb();

const readDb = () => {
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('[Database] Error reading local_db.json:', err);
    return getSeedData();
  }
};

const writeDb = (data) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Database] Error writing local_db.json:', err);
  }
};

// Seed MongoDB if connected and empty
export const seedMongoIfEmpty = async () => {
  const status = getDbStatus();
  if (!status.connected) return;

  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[Database] Seeding initial data into MongoDB...');
      const seed = getSeedData();
      await User.insertMany(seed.users);
      await Category.insertMany(seed.categories);
      await Blog.insertMany(seed.blogs);
      await Comment.insertMany(seed.comments);
      await Bookmark.insertMany(seed.bookmarks);
      console.log('[Database] MongoDB seeded successfully.');
    }
  } catch (err) {
    console.error('[Database] Error seeding MongoDB:', err);
  }
};

// Unified Data Store Provider
export const dbStore = {
  // ---- USERS ----
  async findUserByEmail(email) {
    const status = getDbStatus();
    if (status.connected) {
      return await User.findOne({ email: email.toLowerCase().trim() });
    }
    const db = readDb();
    return db.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim()) || null;
  },

  async findUserById(id) {
    const status = getDbStatus();
    if (status.connected) {
      return await User.findById(id).select('-password');
    }
    const db = readDb();
    const user = db.users.find((u) => u._id === id);
    if (!user) return null;
    const { password, ...safeUser } = user;
    return safeUser;
  },

  async createUser({ name, email, password, role = 'user', profileImage = '', bio = '' }) {
    const status = getDbStatus();
    if (status.connected) {
      return await User.create({ name, email, password, role, profileImage, bio });
    }
    const db = readDb();
    const newUser = {
      _id: generateObjectId(),
      name,
      email: email.toLowerCase().trim(),
      password,
      role,
      profileImage,
      bio,
      createdAt: new Date().toISOString(),
    };
    db.users.push(newUser);
    writeDb(db);
    const { password: _, ...safeUser } = newUser;
    return safeUser;
  },

  async updateUser(id, updateData) {
    const status = getDbStatus();
    if (status.connected) {
      return await User.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
    }
    const db = readDb();
    const idx = db.users.findIndex((u) => u._id === id);
    if (idx === -1) return null;
    db.users[idx] = { ...db.users[idx], ...updateData };
    writeDb(db);
    const { password, ...safeUser } = db.users[idx];
    return safeUser;
  },

  async deleteUser(id) {
    const status = getDbStatus();
    if (status.connected) {
      await User.findByIdAndDelete(id);
      await Blog.deleteMany({ author: id });
      await Comment.deleteMany({ user: id });
      await Bookmark.deleteMany({ user: id });
      return true;
    }
    const db = readDb();
    db.users = db.users.filter((u) => u._id !== id);
    db.blogs = db.blogs.filter((b) => b.author !== id);
    db.comments = db.comments.filter((c) => c.user !== id);
    db.bookmarks = db.bookmarks.filter((bm) => bm.user !== id);
    writeDb(db);
    return true;
  },

  async getAllUsers() {
    const status = getDbStatus();
    if (status.connected) {
      return await User.find().select('-password').sort({ createdAt: -1 });
    }
    const db = readDb();
    return db.users.map(({ password, ...u }) => u).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  // ---- CATEGORIES ----
  async getAllCategories() {
    const status = getDbStatus();
    if (status.connected) {
      return await Category.find().sort({ name: 1 });
    }
    const db = readDb();
    return [...db.categories].sort((a, b) => a.name.localeCompare(b.name));
  },

  async findCategoryById(id) {
    const status = getDbStatus();
    if (status.connected) {
      return await Category.findById(id);
    }
    const db = readDb();
    return db.categories.find((c) => c._id === id) || null;
  },

  async createCategory({ name, description = '' }) {
    const status = getDbStatus();
    if (status.connected) {
      return await Category.create({ name, description });
    }
    const db = readDb();
    const exists = db.categories.find((c) => c.name.toLowerCase() === name.toLowerCase().trim());
    if (exists) throw new Error('Category already exists');
    const newCat = {
      _id: generateObjectId(),
      name: name.trim(),
      description: description.trim(),
      createdAt: new Date().toISOString(),
    };
    db.categories.push(newCat);
    writeDb(db);
    return newCat;
  },

  async updateCategory(id, { name, description }) {
    const status = getDbStatus();
    if (status.connected) {
      return await Category.findByIdAndUpdate(id, { name, description }, { new: true });
    }
    const db = readDb();
    const idx = db.categories.findIndex((c) => c._id === id);
    if (idx === -1) return null;
    if (name) db.categories[idx].name = name.trim();
    if (description !== undefined) db.categories[idx].description = description.trim();
    writeDb(db);
    return db.categories[idx];
  },

  async deleteCategory(id) {
    const status = getDbStatus();
    if (status.connected) {
      return await Category.findByIdAndDelete(id);
    }
    const db = readDb();
    db.categories = db.categories.filter((c) => c._id !== id);
    writeDb(db);
    return true;
  },

  // ---- BLOGS ----
  async getBlogs({ search = '', category = '', status = 'published', authorId = '', tag = '', limit = 50, page = 1 }) {
    const mongoStatus = getDbStatus();
    if (mongoStatus.connected) {
      const query = {};
      if (status && status !== 'all') {
        query.status = status;
      }
      if (authorId) {
        query.author = authorId;
      }
      if (category && category !== 'all') {
        query.$or = [{ category: category }, { categoryName: category }];
      }
      if (tag) {
        query.tags = { $in: [new RegExp(tag, 'i')] };
      }
      if (search) {
        const searchRegex = new RegExp(search, 'i');
        query.$or = [
          { title: searchRegex },
          { content: searchRegex },
          { tags: searchRegex },
          { categoryName: searchRegex },
        ];
      }

      const total = await Blog.countDocuments(query);
      const blogs = await Blog.find(query)
        .populate('author', 'name email profileImage role')
        .populate('category', 'name')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      return { blogs, total, page, totalPages: Math.ceil(total / limit) };
    }

    // Local JSON Store handler
    const db = readDb();
    let filtered = [...db.blogs];

    if (status && status !== 'all') {
      filtered = filtered.filter((b) => b.status === status);
    }
    if (authorId) {
      filtered = filtered.filter((b) => b.author === authorId);
    }
    if (category && category !== 'all') {
      filtered = filtered.filter(
        (b) => b.category === category || b.categoryName?.toLowerCase() === category.toLowerCase()
      );
    }
    if (tag) {
      filtered = filtered.filter((b) => b.tags?.some((t) => t.toLowerCase() === tag.toLowerCase()));
    }
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.title?.toLowerCase().includes(s) ||
          b.content?.toLowerCase().includes(s) ||
          b.categoryName?.toLowerCase().includes(s) ||
          b.tags?.some((t) => t.toLowerCase().includes(s))
      );
    }

    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const total = filtered.length;
    const paginated = filtered.slice((page - 1) * limit, page * limit);

    // Populate author and category
    const populated = paginated.map((b) => {
      const author = db.users.find((u) => u._id === b.author);
      const cat = db.categories.find((c) => c._id === b.category);
      return {
        ...b,
        author: author
          ? { _id: author._id, name: author.name, email: author.email, profileImage: author.profileImage, role: author.role }
          : { _id: b.author, name: 'Unknown Author' },
        category: cat ? { _id: cat._id, name: cat.name } : { name: b.categoryName || 'General' },
      };
    });

    return { blogs: populated, total, page, totalPages: Math.ceil(total / limit) || 1 };
  },

  async getBlogById(id) {
    const mongoStatus = getDbStatus();
    if (mongoStatus.connected) {
      return await Blog.findById(id)
        .populate('author', 'name email profileImage role bio')
        .populate('category', 'name description');
    }
    const db = readDb();
    const blog = db.blogs.find((b) => b._id === id);
    if (!blog) return null;

    const author = db.users.find((u) => u._id === blog.author);
    const cat = db.categories.find((c) => c._id === blog.category);
    return {
      ...blog,
      author: author
        ? { _id: author._id, name: author.name, email: author.email, profileImage: author.profileImage, role: author.role, bio: author.bio }
        : { _id: blog.author, name: 'Unknown Author' },
      category: cat ? { _id: cat._id, name: cat.name, description: cat.description } : { name: blog.categoryName || 'General' },
    };
  },

  async createBlog({ title, content, author, category, categoryName, tags, coverImage, status }) {
    const mongoStatus = getDbStatus();
    if (mongoStatus.connected) {
      return await Blog.create({
        title,
        content,
        author,
        category,
        categoryName,
        tags,
        coverImage,
        status,
        likes: [],
      });
    }
    const db = readDb();
    const newBlog = {
      _id: generateObjectId(),
      title,
      content,
      author,
      category,
      categoryName: categoryName || 'General',
      tags: Array.isArray(tags) ? tags : [],
      coverImage: coverImage || '',
      status: status || 'published',
      likes: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.blogs.push(newBlog);
    writeDb(db);
    return newBlog;
  },

  async updateBlog(id, updateData) {
    const mongoStatus = getDbStatus();
    if (mongoStatus.connected) {
      return await Blog.findByIdAndUpdate(id, { ...updateData, updatedAt: new Date() }, { new: true });
    }
    const db = readDb();
    const idx = db.blogs.findIndex((b) => b._id === id);
    if (idx === -1) return null;
    db.blogs[idx] = {
      ...db.blogs[idx],
      ...updateData,
      updatedAt: new Date().toISOString(),
    };
    writeDb(db);
    return db.blogs[idx];
  },

  async deleteBlog(id) {
    const mongoStatus = getDbStatus();
    if (mongoStatus.connected) {
      await Blog.findByIdAndDelete(id);
      await Comment.deleteMany({ blog: id });
      await Bookmark.deleteMany({ blog: id });
      return true;
    }
    const db = readDb();
    db.blogs = db.blogs.filter((b) => b._id !== id);
    db.comments = db.comments.filter((c) => c.blog !== id);
    db.bookmarks = db.bookmarks.filter((bm) => bm.blog !== id);
    writeDb(db);
    return true;
  },

  async toggleLikeBlog(blogId, userId) {
    const mongoStatus = getDbStatus();
    if (mongoStatus.connected) {
      const blog = await Blog.findById(blogId);
      if (!blog) return null;
      const index = blog.likes.findIndex((id) => id.toString() === userId.toString());
      let liked = false;
      if (index === -1) {
        blog.likes.push(userId);
        liked = true;
      } else {
        blog.likes.splice(index, 1);
        liked = false;
      }
      await blog.save();
      return { liked, likesCount: blog.likes.length, likes: blog.likes };
    }

    const db = readDb();
    const blog = db.blogs.find((b) => b._id === blogId);
    if (!blog) return null;
    if (!Array.isArray(blog.likes)) blog.likes = [];
    const index = blog.likes.indexOf(userId);
    let liked = false;
    if (index === -1) {
      blog.likes.push(userId);
      liked = true;
    } else {
      blog.likes.splice(index, 1);
      liked = false;
    }
    writeDb(db);
    return { liked, likesCount: blog.likes.length, likes: blog.likes };
  },

  // ---- COMMENTS ----
  async getCommentsByBlog(blogId) {
    const mongoStatus = getDbStatus();
    if (mongoStatus.connected) {
      return await Comment.find({ blog: blogId })
        .populate('user', 'name email profileImage role')
        .sort({ createdAt: -1 });
    }
    const db = readDb();
    const comments = db.comments.filter((c) => c.blog === blogId);
    comments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return comments.map((c) => {
      const user = db.users.find((u) => u._id === c.user);
      return {
        ...c,
        user: user
          ? { _id: user._id, name: user.name, email: user.email, profileImage: user.profileImage, role: user.role }
          : { _id: c.user, name: 'Anonymous' },
      };
    });
  },

  async getAllComments() {
    const mongoStatus = getDbStatus();
    if (mongoStatus.connected) {
      return await Comment.find()
        .populate('user', 'name email profileImage role')
        .populate('blog', 'title')
        .sort({ createdAt: -1 });
    }
    const db = readDb();
    const comments = [...db.comments].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return comments.map((c) => {
      const user = db.users.find((u) => u._id === c.user);
      const blog = db.blogs.find((b) => b._id === c.blog);
      return {
        ...c,
        user: user ? { _id: user._id, name: user.name, email: user.email } : { name: 'User' },
        blog: blog ? { _id: blog._id, title: blog.title } : { title: 'Deleted Blog' },
      };
    });
  },

  async createComment({ blogId, userId, text }) {
    const mongoStatus = getDbStatus();
    if (mongoStatus.connected) {
      const comment = await Comment.create({ blog: blogId, user: userId, text });
      return await Comment.findById(comment._id).populate('user', 'name email profileImage role');
    }
    const db = readDb();
    const newComment = {
      _id: generateObjectId(),
      blog: blogId,
      user: userId,
      text: text.trim(),
      createdAt: new Date().toISOString(),
    };
    db.comments.push(newComment);
    writeDb(db);
    const user = db.users.find((u) => u._id === userId);
    return {
      ...newComment,
      user: user ? { _id: user._id, name: user.name, email: user.email, profileImage: user.profileImage, role: user.role } : null,
    };
  },

  async deleteComment(id) {
    const mongoStatus = getDbStatus();
    if (mongoStatus.connected) {
      return await Comment.findByIdAndDelete(id);
    }
    const db = readDb();
    const comment = db.comments.find((c) => c._id === id);
    if (!comment) return null;
    db.comments = db.comments.filter((c) => c._id !== id);
    writeDb(db);
    return comment;
  },

  async findCommentById(id) {
    const mongoStatus = getDbStatus();
    if (mongoStatus.connected) {
      return await Comment.findById(id);
    }
    const db = readDb();
    return db.comments.find((c) => c._id === id) || null;
  },

  // ---- BOOKMARKS ----
  async toggleBookmark(userId, blogId) {
    const mongoStatus = getDbStatus();
    if (mongoStatus.connected) {
      const existing = await Bookmark.findOne({ user: userId, blog: blogId });
      if (existing) {
        await Bookmark.findByIdAndDelete(existing._id);
        return { bookmarked: false };
      }
      await Bookmark.create({ user: userId, blog: blogId });
      return { bookmarked: true };
    }

    const db = readDb();
    const idx = db.bookmarks.findIndex((bm) => bm.user === userId && bm.blog === blogId);
    if (idx !== -1) {
      db.bookmarks.splice(idx, 1);
      writeDb(db);
      return { bookmarked: false };
    }
    db.bookmarks.push({
      _id: generateObjectId(),
      user: userId,
      blog: blogId,
      createdAt: new Date().toISOString(),
    });
    writeDb(db);
    return { bookmarked: true };
  },

  async getUserBookmarks(userId) {
    const mongoStatus = getDbStatus();
    if (mongoStatus.connected) {
      const bookmarks = await Bookmark.find({ user: userId })
        .populate({
          path: 'blog',
          populate: { path: 'author', select: 'name email profileImage' },
        })
        .sort({ createdAt: -1 });
      return bookmarks.map((b) => b.blog).filter(Boolean);
    }

    const db = readDb();
    const userBookmarks = db.bookmarks.filter((bm) => bm.user === userId);
    userBookmarks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return userBookmarks
      .map((bm) => {
        const blog = db.blogs.find((b) => b._id === bm.blog);
        if (!blog) return null;
        const author = db.users.find((u) => u._id === blog.author);
        return {
          ...blog,
          author: author ? { _id: author._id, name: author.name, profileImage: author.profileImage } : null,
        };
      })
      .filter(Boolean);
  },

  async isBlogBookmarked(userId, blogId) {
    if (!userId) return false;
    const mongoStatus = getDbStatus();
    if (mongoStatus.connected) {
      const found = await Bookmark.findOne({ user: userId, blog: blogId });
      return !!found;
    }
    const db = readDb();
    return db.bookmarks.some((bm) => bm.user === userId && bm.blog === blogId);
  },

  // ---- DASHBOARD STATS ----
  async getDashboardStats(userId = null) {
    const mongoStatus = getDbStatus();
    if (mongoStatus.connected) {
      if (userId) {
        // Author dashboard stats
        const totalBlogs = await Blog.countDocuments({ author: userId });
        const publishedBlogs = await Blog.countDocuments({ author: userId, status: 'published' });
        const draftBlogs = await Blog.countDocuments({ author: userId, status: 'draft' });
        const userBlogs = await Blog.find({ author: userId });
        const blogIds = userBlogs.map((b) => b._id);
        const totalLikes = userBlogs.reduce((acc, b) => acc + (b.likes ? b.likes.length : 0), 0);
        const totalComments = await Comment.countDocuments({ blog: { $in: blogIds } });
        const totalBookmarks = await Bookmark.countDocuments({ user: userId });

        return {
          totalBlogs,
          publishedBlogs,
          draftBlogs,
          totalLikes,
          totalComments,
          totalBookmarks,
        };
      } else {
        // Admin system-wide stats
        const totalUsers = await User.countDocuments();
        const totalBlogs = await Blog.countDocuments();
        const publishedBlogs = await Blog.countDocuments({ status: 'published' });
        const draftBlogs = await Blog.countDocuments({ status: 'draft' });
        const totalComments = await Comment.countDocuments();
        const blogs = await Blog.find();
        const totalLikes = blogs.reduce((acc, b) => acc + (b.likes ? b.likes.length : 0), 0);
        const totalCategories = await Category.countDocuments();

        return {
          totalUsers,
          totalBlogs,
          publishedBlogs,
          draftBlogs,
          totalComments,
          totalLikes,
          totalCategories,
        };
      }
    }

    const db = readDb();
    if (userId) {
      const userBlogs = db.blogs.filter((b) => b.author === userId);
      const published = userBlogs.filter((b) => b.status === 'published').length;
      const drafts = userBlogs.filter((b) => b.status === 'draft').length;
      const blogIds = new Set(userBlogs.map((b) => b._id));
      const totalLikes = userBlogs.reduce((acc, b) => acc + (b.likes?.length || 0), 0);
      const totalComments = db.comments.filter((c) => blogIds.has(c.blog)).length;
      const totalBookmarks = db.bookmarks.filter((bm) => bm.user === userId).length;

      return {
        totalBlogs: userBlogs.length,
        publishedBlogs: published,
        draftBlogs: drafts,
        totalLikes,
        totalComments,
        totalBookmarks,
      };
    } else {
      const published = db.blogs.filter((b) => b.status === 'published').length;
      const drafts = db.blogs.filter((b) => b.status === 'draft').length;
      const totalLikes = db.blogs.reduce((acc, b) => acc + (b.likes?.length || 0), 0);

      return {
        totalUsers: db.users.length,
        totalBlogs: db.blogs.length,
        publishedBlogs: published,
        draftBlogs: drafts,
        totalComments: db.comments.length,
        totalLikes,
        totalCategories: db.categories.length,
      };
    }
  },
};
