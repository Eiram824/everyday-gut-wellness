var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
var MODEL_UPGRADES = {
  "gemini-2.5-flash": "gemini-3-flash-preview",
  "gemini-2.5-pro": "gemini-3.1-pro-preview",
  "gemini-3-pro-preview": "gemini-3.1-pro-preview",
  "gemini-2.0-flash": "gemini-3-flash-preview",
  "gemini-2.0-flash-exp": "gemini-3-flash-preview"
};
function resolveModel(model) {
  if (!model) return "gemini-3-flash-preview";
  return MODEL_UPGRADES[model] || model;
}
function serializeGenerateContentResponse(r) {
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
    codeExecutionResult: r?.codeExecutionResult
  };
}
var chats = /* @__PURE__ */ new Map();
var videoOps = /* @__PURE__ */ new Map();
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = Number(process.env.PORT) || 3e3;
  app.use(import_express.default.json({ limit: "50mb" }));
  app.use(import_express.default.urlencoded({ limit: "50mb", extended: true }));
  for (const dir of ["examples", "assets", "public"]) {
    const dirPath = import_path.default.join(process.cwd(), dir);
    if (import_fs.default.existsSync(dirPath)) {
      app.use(`/${dir}`, import_express.default.static(dirPath));
    }
  }
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });
  app.post("/api/generate-content", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
      if (!apiKey) {
        return res.status(503).json({
          error: "API key is not configured. Please add your GEMINI_API_KEY in Settings > Secrets."
        });
      }
      const ai = new import_genai.GoogleGenAI({ apiKey });
      const params = { ...req.body, model: resolveModel(req.body?.model) };
      const response = await ai.models.generateContent(params);
      return res.json(serializeGenerateContentResponse(response));
    } catch (error) {
      console.error("[Backend] /api/generate-content error:", error);
      return res.status(500).json({ error: error.message || "Failed to generate content." });
    }
  });
  app.post("/api/generate-content-stream", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
      if (!apiKey) {
        return res.status(503).json({
          error: "API key is not configured. Please add your GEMINI_API_KEY in Settings > Secrets."
        });
      }
      const ai = new import_genai.GoogleGenAI({ apiKey });
      const params = { ...req.body, model: resolveModel(req.body?.model) };
      const stream = await ai.models.generateContentStream(params);
      res.setHeader("Content-Type", "application/x-ndjson");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      for await (const chunk of stream) {
        res.write(JSON.stringify(serializeGenerateContentResponse(chunk)) + "\n");
      }
      res.end();
    } catch (error) {
      console.error("[Backend] /api/generate-content-stream error:", error);
      if (!res.headersSent) {
        return res.status(500).json({ error: error.message || "Failed to stream content." });
      }
      res.end();
    }
  });
  app.post("/api/chat-message", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
      if (!apiKey) {
        return res.status(503).json({
          error: "API key is not configured. Please add your GEMINI_API_KEY in Settings > Secrets."
        });
      }
      const { sessionId, model, config, history, message, msgConfig } = req.body || {};
      const ai = new import_genai.GoogleGenAI({ apiKey });
      let chat = sessionId ? chats.get(sessionId) : void 0;
      if (!chat) {
        chat = ai.chats.create({
          model: resolveModel(model),
          config,
          history
        });
        if (sessionId) chats.set(sessionId, chat);
      }
      const response = await chat.sendMessage({ message, config: msgConfig });
      return res.json(serializeGenerateContentResponse(response));
    } catch (error) {
      console.error("[Backend] /api/chat-message error:", error);
      return res.status(500).json({ error: error.message || "Failed to send chat message." });
    }
  });
  app.post("/api/chat-stream", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
      if (!apiKey) {
        return res.status(503).json({
          error: "API key is not configured. Please add your GEMINI_API_KEY in Settings > Secrets."
        });
      }
      const { sessionId, model, config, history, message, msgConfig } = req.body || {};
      const ai = new import_genai.GoogleGenAI({ apiKey });
      let chat = sessionId ? chats.get(sessionId) : void 0;
      if (!chat) {
        chat = ai.chats.create({
          model: resolveModel(model),
          config,
          history
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
    } catch (error) {
      console.error("[Backend] /api/chat-stream error:", error);
      if (!res.headersSent) {
        return res.status(500).json({ error: error.message || "Failed to stream chat message." });
      }
      res.end();
    }
  });
  app.post("/api/generate-images", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
      if (!apiKey) {
        return res.status(503).json({
          error: "API key is not configured. Please add your GEMINI_API_KEY in Settings > Secrets."
        });
      }
      const ai = new import_genai.GoogleGenAI({ apiKey });
      const response = await ai.models.generateImages(req.body);
      return res.json(response);
    } catch (error) {
      console.error("[Backend] /api/generate-images error:", error);
      return res.status(500).json({ error: error.message || "Failed to generate images." });
    }
  });
  app.post("/api/generate-videos", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
      if (!apiKey) {
        return res.status(503).json({
          error: "API key is not configured. Please add your GEMINI_API_KEY in Settings > Secrets."
        });
      }
      const ai = new import_genai.GoogleGenAI({ apiKey });
      const op = await ai.models.generateVideos(req.body);
      if (op.name) {
        videoOps.set(op.name, op);
      }
      return res.json({
        name: op.name,
        done: op.done,
        metadata: op.metadata,
        error: op.error,
        response: op.response
      });
    } catch (error) {
      console.error("[Backend] /api/generate-videos error:", error);
      return res.status(500).json({ error: error.message || "Failed to start video generation." });
    }
  });
  app.post("/api/videos-operation", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
      if (!apiKey) {
        return res.status(503).json({
          error: "API key is not configured. Please add your GEMINI_API_KEY in Settings > Secrets."
        });
      }
      const ai = new import_genai.GoogleGenAI({ apiKey });
      const opName = req.body?.operation?.name;
      const storedOp = opName ? videoOps.get(opName) : void 0;
      if (!storedOp) {
        return res.status(404).json({ error: "Video operation not found on server." });
      }
      const op = await ai.operations.getVideosOperation({ operation: storedOp });
      if (op.name) {
        videoOps.set(op.name, op);
      }
      const responseCopy = op.response ? JSON.parse(JSON.stringify(op.response)) : void 0;
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
        response: responseCopy
      });
    } catch (error) {
      console.error("[Backend] /api/videos-operation error:", error);
      return res.status(500).json({ error: error.message || "Failed to poll video operation." });
    }
  });
  app.get("/api/video-download", async (req, res) => {
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
    } catch (error) {
      console.error("[Backend] /api/video-download error:", error);
      return res.status(500).json({ error: error.message || "Failed to download video." });
    }
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.use((_req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Backend] Server running on http://localhost:${PORT}`);
  });
}
startServer();
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
//# sourceMappingURL=server.cjs.map
