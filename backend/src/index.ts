import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import compression from "compression";
import rateLimit from "express-rate-limit";
import { createServer } from "http";
import { Server } from "socket.io";
import winston from "winston";
import path from "path";
import prisma from "./lib/prisma";

// Chargement des variables d'environnement
dotenv.config();

const app = express();
const httpServer = createServer(app);

// Configuration du logger (Base pour ELK)
const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  defaultMeta: { service: "sama-link-backend" },
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}

// Socket.io pour les fonctionnalités temps réel
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:4200",
    methods: ["GET", "POST"],
  },
});

// Middlewares de sécurité et utilitaires
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "http://localhost:3000", "http://localhost:4200"],
      connectSrc: ["'self'", "http://localhost:3000"],
    }
  }
}));
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:4200",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
})); // Gestion du CORS
app.use(express.json()); // Parsing du JSON
app.use(morgan("dev")); // Logging des requêtes HTTP
app.use(compression()); // Compression Gzip

// Rate Limiting (Protection contre brute-force et DDoS)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limite chaque IP à 100 requêtes par fenêtre
  message: { message: "Trop de requêtes, veuillez réessayer plus tard." }
});

const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 10, // Limite chaque IP à 10 tentatives de connexion par heure
  message: { message: "Trop de tentatives de connexion, réessayez dans une heure." }
});

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads'))); // Servir les fichiers téléversés

// Import des routes
import authRoutes from './routes/auth.routes';
import feedRoutes from './routes/feed.routes';
import interactionRoutes from './routes/interaction.routes';
import matchingRoutes from './routes/matching.routes';
import messagingRoutes from './routes/messaging.routes';

// Utilisation des routes
console.log("Enregistrement des routes...");
app.use('/api', apiLimiter);
app.use('/api/auth', authLimiter, authRoutes);
console.log("Routes Auth enregistrées");
app.use('/api/feed', feedRoutes);
console.log("Routes Feed enregistrées");
app.use('/api/interactions', interactionRoutes);
console.log("Routes Interactions enregistrées");
app.use('/api/matching', matchingRoutes);
console.log("Routes Matching enregistrées");
app.use('/api/messaging', messagingRoutes);
console.log("Routes Messaging enregistrées");

// Route de base pour vérifier que le serveur tourne
app.get("/", (req, res) => {
  res.json({
    message: "Bienvenue sur l'API de Sama Link",
    status: "online",
    version: "1.0.0",
  });
});

// Import des sockets
import { initSocket } from './socket/index';

// Initialisation des sockets
initSocket(io);

// Démarrage du serveur
const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  logger.info(`Serveur démarré sur le port ${PORT} 🚀`);
  console.log(`Serveur disponible sur http://localhost:${PORT}`);
});

export { app, io, logger };
