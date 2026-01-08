import { type Server } from "node:http";
import type { Express, Request, Response, NextFunction } from "express";

import { registerRoutes } from "./routes";
import { initializeDatabase } from "../db/init";

/* =========================================================
   Logger simples
========================================================= */
function log(message: string, source = "express") {
  const time = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${time} [${source}] ${message}`);
}

/* =========================================================
   Runner principal da aplicação
========================================================= */
export default async function runApp(
  app: Express,
  setup: (app: Express, server: Server) => Promise<void>,
) {
  // 🔧 FIX: Usar 0.0.0.0 em produção para Render
  const host = process.env.NODE_ENV === 'production' 
    ? '0.0.0.0' 
    : (process.env.HOST || 'localhost');
    
  const port = Number(process.env.PORT || 3000);

  let server: Server;

  /* =======================================================
     PHASE 1 — Bootstrap (fail-fast)
  ======================================================= */
  try {
    // SQLite não requer verificação de DATABASE_URL
    // DATABASE_PATH tem valor padrão em db/index.ts
    
    log("Initializing database...");
    await initializeDatabase();
    log("Database initialization complete");

    log("Registering routes...");
    server = await registerRoutes(app);

    if (!server) {
      throw new Error("registerRoutes did not return a server instance");
    }

    log("Routes registered");
  } catch (err) {
    console.error("❌ FATAL: Server bootstrap failed");
    console.error(err);
    process.exit(1);
  }

  /* =======================================================
     Middleware global de erro (não derruba o server)
  ======================================================= */
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || 500;
    const message = err.message || "Internal Server Error";

    console.error("Request error:", err);
    res.status(status).json({ message });
  });

  /* =======================================================
     PHASE 2 — Start server (UMA porta, UMA vez)
  ======================================================= */
  server.listen(port, host, async () => {
    log(`✓ Server listening on ${host}:${port}`);
    log(`Environment: ${process.env.NODE_ENV || "development"}`);
    
    // Mostrar URL pública em produção
    if (process.env.NODE_ENV === 'production') {
      log(`🌐 Public URL: https://${process.env.RENDER_EXTERNAL_HOSTNAME || 'your-app.onrender.com'}`);
    } else {
      log(`Access at: http://${host}:${port}`);
    }

    /* =====================================================
       PHASE 3 — Setup (Vite ou Static)
    ===================================================== */
    try {
      log("Running setup (Vite / Static)...");
      await setup(app, server);

      const { markAppReady } = await import("./app");
      markAppReady();

      log("✅ Application ready");

    } catch (err) {
      console.error("❌ ERROR: Setup failed");
      console.error(err);
      console.error(
        "⚠️  Server is running, but application setup is incomplete",
      );
    }
  });

  /* =======================================================
     Tratamento explícito de erro de porta
  ======================================================= */
  server.on("error", (err: any) => {
    if (err.code === "EADDRINUSE") {
      console.error(`❌ Porta ${port} já está em uso`);
    } else {
      console.error("❌ Server error:", err);
    }
    process.exit(1);
  });
}