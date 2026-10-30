/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const MODEL_UPGRADES: Record<string, string> = {
  "gemini-2.5-flash": "gemini-3-flash-preview",
  "gemini-2.5-pro": "gemini-3.1-pro-preview",
  "gemini-3-pro-preview": "gemini-3.1-pro-preview",
  "gemini-2.0-flash": "gemini-3-flash-preview",
  "gemini-2.0-flash-exp": "gemini-3-flash-preview",
};

function resolveModel(model?: string): string {
  if (!model) return "gemini-3-flash-preview";
  return MODEL_UPGRADES[model] || model;
}

function serializeGenerateContentResponse(r: any) {
  return {
    candidates: r?.candidates,
    promptFeedback: r?.promptFeedback,
    usageMetadata: r?.usageMetadata,
    modelVersion: r?.modelVersion,
    responseId: r?.responseId,
    text: r?.text,
    functionCalls: r?.functionCalls,
    data: r?.data,
    executableCode: r?.executableCode,
    codeExecutionResult: r?.codeExecutionResult,
  };
}

const chats = new Map<string, any>();
const videoOps = new Map<string, any>();

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  for (const dir of ["examples", "assets", "public"]) {
    const dirPath = path.join(process.cwd(), dir);
    if (fs.existsSync(dirPath)) {
      app.use(`/${dir}`, express.static(dirPath));
    }
  }

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // Subscriber Lead Management & Sender.net Integration
  const DATA_DIR = path.join(process.cwd(), "data");
  const SUBSCRIBERS_FILE = path.join(DATA_DIR, "subscribers.json");

  function getSubscribers(): Array<{ id: string; name: string; email: string; date: string; source: string; senderSynced: boolean }> {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (!fs.existsSync(SUBSCRIBERS_FILE)) {
        fs.writeFileSync(SUBSCRIBERS_FILE, JSON.stringify([], null, 2), "utf8");
        return [];
      }
      const data = fs.readFileSync(SUBSCRIBERS_FILE, "utf8");
      return JSON.parse(data) || [];
    } catch (err) {
      console.error("[Backend] Error reading subscribers file:", err);
      return [];
    }
  }

  function saveSubscribers(subscribers: any[]) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(SUBSCRIBERS_FILE, JSON.stringify(subscribers, null, 2), "utf8");
    } catch (err) {
      console.error("[Backend] Error saving subscribers file:", err);
    }
  }

  // Sender.net Configuration Helper
  const SENDER_CONFIG_FILE = path.join(DATA_DIR, "sender_config.json");
  function getSenderConfig(): { apiToken?: string; groupId?: string; groupTitle?: string } {
    try {
      if (fs.existsSync(SENDER_CONFIG_FILE)) {
        const raw = fs.readFileSync(SENDER_CONFIG_FILE, "utf8");
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn("[Backend] Error reading sender_config.json:", e);
    }
    return {
      apiToken: process.env.SENDER_API_TOKEN,
      groupId: process.env.SENDER_GROUP_ID,
    };
  }

  app.post("/api/subscribe", async (req, res): Promise<any> => {
    try {
      const { name, email, source = "ebook_lead_magnet" } = req.body || {};
      const trimmedEmail = (email || "").trim().toLowerCase();
      const trimmedName = (name || "").trim() || "Reader";

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
        return res.status(400).json({ error: "Please provide a valid email address." });
      }

      const subscribers = getSubscribers();
      const existingIndex = subscribers.findIndex((s) => s.email === trimmedEmail);

      let senderSynced = false;
      let senderMessage = "";

      // Sender.net API integration (v2)
      const senderCfg = getSenderConfig();
      const senderToken = process.env.SENDER_API_TOKEN || senderCfg.apiToken;
      const senderGroupId = process.env.SENDER_GROUP_ID || senderCfg.groupId;

      if (senderToken) {
        try {
          const senderPayload: any = {
            email: trimmedEmail,
            firstname: trimmedName,
          };
          if (senderGroupId) {
            senderPayload.groups = [senderGroupId];
          }

          const senderRes = await fetch("https://api.sender.net/v2/subscribers", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${senderToken}`,
              "Content-Type": "application/json",
              "Accept": "application/json",
            },
            body: JSON.stringify(senderPayload),
          });

          if (senderRes.ok) {
            senderSynced = true;
            senderMessage = "Successfully synced with Sender.net list.";
          } else {
            const errData = await senderRes.json().catch(() => ({}));
            console.warn("[Backend] Sender.net API non-OK response:", senderRes.status, errData);
            senderMessage = `Sender.net status ${senderRes.status}. Saved to local subscriber list.`;
          }
        } catch (senderErr: any) {
          console.error("[Backend] Sender.net API error:", senderErr.message);
          senderMessage = "Saved locally; Sender.net sync will retry.";
        }
      } else {
        senderMessage = "Saved to local subscriber list (Sender.net token not configured).";
      }

      const subscriberRecord = {
        id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        name: trimmedName,
        email: trimmedEmail,
        date: new Date().toISOString(),
        source: String(source),
        senderSynced,
      };

      if (existingIndex >= 0) {
        subscribers[existingIndex] = {
          ...subscribers[existingIndex],
          name: trimmedName,
          date: new Date().toISOString(),
          senderSynced: senderSynced || subscribers[existingIndex].senderSynced,
        };
      } else {
        subscribers.unshift(subscriberRecord);
      }

      saveSubscribers(subscribers);

      return res.json({
        success: true,
        message: "Thank you for subscribing! Your free 7-Day Reset Guide is unlocked.",
        subscriber: { name: trimmedName, email: trimmedEmail },
        senderSynced,
        senderStatus: senderMessage,
      });
    } catch (error: any) {
      console.error("[Backend] /api/subscribe error:", error);
      return res.status(500).json({ error: error.message || "Failed to process subscription." });
    }
  });

  // Fetch subscriber count and list for admin viewing
  app.get("/api/leads", (_req, res) => {
    const subscribers = getSubscribers();
    const senderCfg = getSenderConfig();
    const isConfigured = Boolean(process.env.SENDER_API_TOKEN || senderCfg.apiToken);
    res.json({
      total: subscribers.length,
      senderConfigured: isConfigured,
      senderGroupTitle: senderCfg.groupTitle || "Gut Wellness - eBook Leads",
      subscribers,
    });
  });

  // Export subscriber list as CSV file
  app.get("/api/leads/export.csv", (_req, res) => {
    const subscribers = getSubscribers();
    
    // RFC-compliant CSV escaping
    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const header = ["ID", "Name", "Email", "Date Subscribed", "Source", "Sender Synced"];
    const rows = subscribers.map((sub) => [
      escapeCsv(sub.id),
      escapeCsv(sub.name),
      escapeCsv(sub.email),
      escapeCsv(sub.date),
      escapeCsv(sub.source),
      escapeCsv(sub.senderSynced ? "Yes" : "No"),
    ]);

    const csvContent = [header.join(","), ...rows.map((r) => r.join(","))].join("\n") + "\n";

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="gut_wellness_subscribers.csv"');
    res.status(200).send(csvContent);
  });


  app.post("/api/generate-content", async (req, res): Promise<any> => {
    try {
      const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
      if (!apiKey) {
        return res.status(503).json({
          error: "API key is not configured. Please add your GEMINI_API_KEY in Settings > Secrets.",
        });
      }
      const ai = new GoogleGenAI({ apiKey });
      const params = { ...req.body, model: resolveModel(req.body?.model) };
      const response = await ai.models.generateContent(params);
      return res.json(serializeGenerateContentResponse(response));
    } catch (error: any) {
      console.error("[Backend] /api/generate-content error:", error);
      return res.status(500).json({ error: error.message || "Failed to generate content." });
    }
  });

  app.post("/api/generate-content-stream", async (req, res): Promise<any> => {
    try {
      const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
      if (!apiKey) {
        return res.status(503).json({
          error: "API key is not configured. Please add your GEMINI_API_KEY in Settings > Secrets.",
        });
      }
      const ai = new GoogleGenAI({ apiKey });
      const params = { ...req.body, model: resolveModel(req.body?.model) };
      const stream = await ai.models.generateContentStream(params);
      res.setHeader("Content-Type", "application/x-ndjson");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      for await (const chunk of stream) {
        res.write(JSON.stringify(serializeGenerateContentResponse(chunk)) + "\n");
      }
      res.end();
    } catch (error: any) {
      console.error("[Backend] /api/generate-content-stream error:", error);
      if (!res.headersSent) {
        return res.status(500).json({ error: error.message || "Failed to stream content." });
      }
      res.end();
    }
  });

  app.post("/api/chat-message", async (req, res): Promise<any> => {
    try {
      const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
      if (!apiKey) {
        return res.status(503).json({
          error: "API key is not configured. Please add your GEMINI_API_KEY in Settings > Secrets.",
        });
      }
      const { sessionId, model, config, history, message, msgConfig } = req.body || {};
      const ai = new GoogleGenAI({ apiKey });
      let chat = sessionId ? chats.get(sessionId) : undefined;
      if (!chat) {
        chat = ai.chats.create({
          model: resolveModel(model),
          config,
          history,
        });
        if (sessionId) chats.set(sessionId, chat);
      }
      const response = await chat.sendMessage({ message, config: msgConfig });
      return res.json(serializeGenerateContentResponse(response));
    } catch (error: any) {
      console.error("[Backend] /api/chat-message error:", error);
      return res.status(500).json({ error: error.message || "Failed to send chat message." });
    }
  });

  app.post("/api/chat-stream", async (req, res): Promise<any> => {
    try {
      const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
      if (!apiKey) {
        return res.status(503).json({
          error: "API key is not configured. Please add your GEMINI_API_KEY in Settings > Secrets.",
        });
      }
      const { sessionId, model, config, history, message, msgConfig } = req.body || {};
      const ai = new GoogleGenAI({ apiKey });
      let chat = sessionId ? chats.get(sessionId) : undefined;
      if (!chat) {
        chat = ai.chats.create({
          model: resolveModel(model),
          config,
          history,
        });
        if (sessionId) chats.set(sessionId, chat);
      }
      const stream = await chat.sendMessageStream({ message, config: msgConfig });
      res.setHeader("Content-Type", "application/x-ndjson");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      for await (const chunk of stream) {
        res.write(JSON.stringify(serializeGenerateContentResponse(chunk)) + "\n");
      }
      res.end();
    } catch (error: any) {
      console.error("[Backend] /api/chat-stream error:", error);
      if (!res.headersSent) {
        return res.status(500).json({ error: error.message || "Failed to stream chat message." });
      }
      res.end();
    }
  });

  app.post("/api/generate-images", async (req, res): Promise<any> => {
    try {
      const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
      if (!apiKey) {
        return res.status(503).json({
          error: "API key is not configured. Please add your GEMINI_API_KEY in Settings > Secrets.",
        });
      }
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateImages(req.body);
      return res.json(response);
    } catch (error: any) {
      console.error("[Backend] /api/generate-images error:", error);
      return res.status(500).json({ error: error.message || "Failed to generate images." });
    }
  });

  app.post("/api/generate-videos", async (req, res): Promise<any> => {
    try {
      const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
      if (!apiKey) {
        return res.status(503).json({
          error: "API key is not configured. Please add your GEMINI_API_KEY in Settings > Secrets.",
        });
      }
      const ai = new GoogleGenAI({ apiKey });
      const op = await ai.models.generateVideos(req.body);
      if (op.name) {
        videoOps.set(op.name, op);
      }
      return res.json({
        name: op.name,
        done: op.done,
        metadata: op.metadata,
        error: op.error,
        response: op.response,
      });
    } catch (error: any) {
      console.error("[Backend] /api/generate-videos error:", error);
      return res.status(500).json({ error: error.message || "Failed to start video generation." });
    }
  });

  app.post("/api/videos-operation", async (req, res): Promise<any> => {
    try {
      const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
      if (!apiKey) {
        return res.status(503).json({
          error: "API key is not configured. Please add your GEMINI_API_KEY in Settings > Secrets.",
        });
      }
      const ai = new GoogleGenAI({ apiKey });
      const opName = req.body?.operation?.name;
      const storedOp = opName ? videoOps.get(opName) : undefined;
      if (!storedOp) {
        return res.status(404).json({ error: "Video operation not found on server." });
      }
      const op = await ai.operations.getVideosOperation({ operation: storedOp });
      if (op.name) {
        videoOps.set(op.name, op);
      }
      const responseCopy = op.response ? JSON.parse(JSON.stringify(op.response)) : undefined;
      if (op.done && responseCopy?.generatedVideos) {
        for (const gv of responseCopy.generatedVideos) {
          if (gv.video?.uri) {
            gv.video.uri = `/api/video-download?uri=${encodeURIComponent(gv.video.uri)}`;
          }
        }
      }
      return res.json({
        name: op.name,
        done: op.done,
        metadata: op.metadata,
        error: op.error,
        response: responseCopy,
      });
    } catch (error: any) {
      console.error("[Backend] /api/videos-operation error:", error);
      return res.status(500).json({ error: error.message || "Failed to poll video operation." });
    }
  });

  app.get("/api/video-download", async (req, res): Promise<any> => {
    try {
      const apiKey = (process.env.GEMINI_API_KEY || process.env.API_KEY || "").trim();
      if (!apiKey) {
        return res.status(503).json({ error: "API key is not configured." });
      }
      const rawUri = String(req.query.uri || "").split("&key=")[0];
      if (!rawUri) {
        return res.status(400).json({ error: "Missing uri parameter." });
      }
      const sep = rawUri.includes("?") ? "&" : "?";
      const downloadUrl = `${rawUri}${sep}key=${apiKey}`;
      const upstream = await fetch(downloadUrl);
      if (!upstream.ok) {
        const errText = await upstream.text().catch(() => "");
        return res.status(upstream.status).send(errText || upstream.statusText);
      }
      res.setHeader("Content-Type", upstream.headers.get("content-type") || "video/mp4");
      const arrayBuf = await upstream.arrayBuffer();
      return res.send(Buffer.from(arrayBuf));
    } catch (error: any) {
      console.error("[Backend] /api/video-download error:", error);
      return res.status(500).json({ error: error.message || "Failed to download video." });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.use((_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Backend] Server running on http://localhost:${PORT}`);
  });
}

startServer();
