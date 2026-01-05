import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import winston from "winston";

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
app.use(helmet()); // Sécurisation des headers HTTP
app.use(cors()); // Gestion du CORS
app.use(express.json()); // Parsing du JSON
app.use(morgan("dev")); // Logging des requêtes HTTP

// Import des routes
import authRoutes from './routes/auth.routes';
import feedRoutes from './routes/feed.routes';
import interactionRoutes from './routes/interaction.routes';

// Utilisation des routes
console.log("Enregistrement des routes...");
app.use('/api/auth', authRoutes);
console.log("Routes Auth enregistrées");
app.use('/api/feed', feedRoutes);
console.log("Routes Feed enregistrées");
app.use('/api/interactions', interactionRoutes);
console.log("Routes Interactions enregistrées");

// Route de base pour vérifier que le serveur tourne
app.get("/", (req, res) => {
  res.json({
    message: "Bienvenue sur l'API de Sama Link",
    status: "online",
    version: "1.0.0",
  });
});

// Gestion des connexions Socket.io
io.on("connection", (socket) => {
  logger.info(`Nouvelle connexion Socket.io : ${socket.id}`);

  socket.on("disconnect", () => {
    logger.info(`Utilisateur déconnecté : ${socket.id}`);
  });
});

// Démarrage du serveur
const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  logger.info(`Serveur démarré sur le port ${PORT} 🚀`);
  console.log(`Serveur disponible sur http://localhost:${PORT}`);
});

export { app, io, logger };
