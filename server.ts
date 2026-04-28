import firebaseConfig from "./firebase-applet-config.json" with { type: "json" };
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { Server } from "socket.io";
import { createServer } from "http";
import admin from "firebase-admin";
import { getFirestore, Firestore, Timestamp } from "firebase-admin/firestore";
import sharp from "sharp";

// Initialize Firebase Admin
const adminApp = admin.apps.length === 0 
  ? admin.initializeApp({ projectId: firebaseConfig.projectId }) 
  : admin.app();

// Target the specific database using the Firestore constructor directly to avoid ambient conflicts
const db = new Firestore({
  projectId: firebaseConfig.projectId,
  databaseId: firebaseConfig.firestoreDatabaseId || "(default)",
});

db.settings({ ignoreUndefinedProperties: true });

console.log(`[Firebase] Configured for Project: ${firebaseConfig.projectId}, Database: ${firebaseConfig.firestoreDatabaseId || "(default)"}`);

// Test connection state
let lastConnectionTest = "Pending";
(async () => {
  try {
    const testSnapshot = await db.collection("devices").limit(1).get();
    lastConnectionTest = `Success (Found ${testSnapshot.size} devices)`;
    console.log(`[Firebase] Initial connection test: ${lastConnectionTest}`);
  } catch (e) {
    lastConnectionTest = `Failed: ${e instanceof Error ? e.message : String(e)}`;
    console.error(`[Firebase] Initial connection test failed:`, e);
  }
})();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  app.use(express.text({ limit: '10mb' })); // ZKTeco sends raw text/custom formats
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // --- ZKTeco PUSH Protocol Endpoints ---

  // Device Ping / Initialization
  // GET /iclock/cdata?SN=...&options=all&pushver=...
  app.get("/iclock/cdata", async (req, res) => {
    const { SN, options, pushver } = req.query;
    console.log(`[ZKTeco] Ping from Device SN: ${SN}`);
    
    if (SN) {
      try {
        const snapshot = await db.collection("devices").where("serialNumber", "==", SN).get();
        if (!snapshot.empty) {
          const deviceDoc = snapshot.docs[0];
          await deviceDoc.ref.update({
            lastSeen: Timestamp.now(),
            status: "ONLINE"
          });
          io.emit("deviceStatus", { SN, status: "ONLINE" });
        }
      } catch (e) {
        console.error("Error updating device status:", e);
      }
    }
    
    res.send("OK");
  });

  setInterval(async () => {
    try {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const snapshot = await db.collection("devices").where("status", "==", "ONLINE").get();
      
      for (const deviceDoc of snapshot.docs) {
        const data = deviceDoc.data();
        const lastSeen = data.lastSeen?.toDate();
        if (lastSeen && lastSeen < fiveMinutesAgo) {
          await deviceDoc.ref.update({
            status: "OFFLINE"
          });
          io.emit("deviceOffline", { 
            SN: data.serialNumber, 
            name: data.name,
            timestamp: new Date().toISOString()
          });
          console.log(`[System] Device ${data.serialNumber} marked OFFLINE`);
        }
      }
    } catch (e) {
      console.error(`[System] Error in offline detection task (DB: ${firebaseConfig.firestoreDatabaseId}):`, e);
      if (e instanceof Error && e.message.includes('permission')) {
        console.warn("[System] Service account may lack permissions for this database.");
      }
    }
  }, 60000);

  // Access Logs / Data Upload
  // POST /iclock/cdata?SN=...&table=ATTLOG
  app.post("/iclock/cdata", async (req, res) => {
    const { SN, table } = req.query;
    const body = req.body;
    console.log(`[ZKTeco] Data Upload from Device SN: ${SN}, Table: ${table}`);
    
    if (table === "ATTLOG") {
      // Parse attendance logs (usually one per line)
      const lines = body.split("\n").filter((l: string) => l.trim());
      for (const line of lines) {
        const parts = line.split("\t");
        if (parts.length >= 2) {
          const pin = parts[0];
          const time = parts[1];
          
          await db.collection("accessLogs").add({
            serialNumber: SN,
            pin,
            timestamp: time,
            type: "VERIFY",
            raw: line,
            createdAt: Timestamp.now()
          });

          // Notify dashboard
          io.emit("newAccess", { SN, pin, time });
        }
      }
    }
    
    res.send("OK");
  });

  // Command Polling
  // GET /iclock/getrequest?SN=...
  app.get("/iclock/getrequest", async (req, res) => {
    const { SN } = req.query;
    console.log(`[ZKTeco] Command Polling from Device SN: ${SN}`);

    try {
      const snapshot = await db.collection("commands")
        .where("status", "==", "PENDING")
        .orderBy("createdAt", "asc")
        .limit(1)
        .get();
      
      if (!snapshot.empty) {
        const cmdDoc = snapshot.docs[0];
        const cmdData = cmdDoc.data();
        
        // Mark as sent
        await cmdDoc.ref.update({
          status: "SENT",
          sentAt: Timestamp.now()
        });

        // Response format: C:ID:PAYLOAD
        res.send(`C:${cmdDoc.id}:${cmdData.payload}`);
        return;
      }
    } catch (error) {
      console.error("[ZKTeco] Error fetching commands:", error);
    }

    res.send("OK");
  });

  // Command Result
  // POST /iclock/devicecmd?SN=...
  app.post("/iclock/devicecmd", async (req, res) => {
    const { SN } = req.query;
    const body = req.body; // Usually format: ID=...&Return=...
    console.log(`[ZKTeco] Command Result from Device SN: ${SN}: ${body}`);
    
    // Parse result and update command status in Firestore
    const matchId = body.match(/ID=([^&]+)/);
    const matchReturn = body.match(/Return=([^&]+)/);
    
    if (matchId && matchReturn) {
      const cmdId = matchId[1];
      const returnCode = matchReturn[1];
      
      try {
        await db.collection("commands").doc(cmdId).update({
          status: returnCode === "0" ? "EXECUTED" : "FAILED",
          returnCode: returnCode,
          executedAt: Timestamp.now()
        });
      } catch (e) {
        console.error(`[ZKTeco] Error updating command ${cmdId}:`, e);
      }
    }

    res.send("OK");
  });

  // --- API Endpoints ---

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/debug-firebase", (req, res) => {
    res.json({ 
      connection: lastConnectionTest,
      config: {
        projectId: firebaseConfig.projectId,
        databaseId: firebaseConfig.firestoreDatabaseId || "(default)"
      }
    });
  });

  // Simulation endpoint for demo purposes
  app.post("/api/simulate/offline", (req, res) => {
    const { SN, name } = req.body;
    io.emit("deviceOffline", { 
      SN: SN || "SIM-001", 
      name: name || "Simulated Portal 01",
      timestamp: new Date().toISOString()
    });
    res.json({ success: true });
  });

  // Endpoint to prepare a photo for ZKTeco (resize/convert to Base64)
  app.post("/api/process-photo", async (req, res) => {
    const { imageBase64 } = req.body;
    if (!imageBase64) return res.status(400).json({ error: "Missing image" });

    try {
      const buffer = Buffer.from(imageBase64, 'base64');
      const processedBuffer = await sharp(buffer)
        .resize(320, 240, { fit: 'inside' }) // Standard ZKTeco face size
        .toFormat('jpg')
        .jpeg({ quality: 80 })
        .toBuffer();
      
      res.json({ processedBase64: processedBuffer.toString('base64') });
    } catch (error) {
      console.error("Image processing error:", error);
      res.status(500).json({ error: "Processing failed" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const PORT = 3000;
  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
