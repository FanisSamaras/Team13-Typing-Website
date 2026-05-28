import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { engine } from 'express-handlebars';
import session from 'express-session';
import setupRoutes from './routes/Routes.mjs';
import { loadApiData } from './config/apiCache.mjs';

// Configuration
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SESSION_SECRET = process.env.SESSION_SECRET || 'typing-website-secret';
const SESSION_MAX_AGE = process.env.SESSION_MAX_AGE || 24 * 60 * 60 * 1000;
const PUBLIC_DIR = path.join(__dirname, '../public');
const VIEWS_DIR = path.join(__dirname, '../views');

// Initialize Express app
const app = express();

// Template engine setup
app.engine('hbs', engine({ extname: '.hbs' }));
app.set('view engine', 'hbs');
app.set('views', VIEWS_DIR);

// Body parsing middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session configuration
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure = true,
    sameSite = "lax",
    maxAge: SESSION_MAX_AGE },
}));

// Make user data available to all views
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// Static files
app.use(express.static(PUBLIC_DIR));

// Load API data cache
loadApiData();

// API routes
setupRoutes(app);

app.use((req,res,next) => {
  const err = new Error(`Not found - ${req.originalUrl}`);
  err.status = 404;
  next(err);
})

app.use((err,req,res,next) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error" ;

  console.error(`[${status}] ${message}`, err);
  if (req.accepts('html')) {
    return res.status(status).render('error', { title: 'Error', status, message });
  }
  if (req.accepts('json')) {
    return res.status(status).json({ error: message, status });
  }
  res.type('txt').status(status).send(message);
})

export default app;
