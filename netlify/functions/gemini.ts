import type { Handler } from "@netlify/functions";
import { GoogleGenAI } from "@google/genai";
import { jsonResponse, errorResponse } from "./lib/auth.js";

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

function getApiKey(): string {
  return (process.env.GEMINI_API_KEY || process.env.API_KEY || "").trim();
}

const ALLOWED_VIDEO_HOSTS = [
  "generativelanguage.googleapis.com",
  "storage.googleapis.com",
  "lh3.googleusercontent.com",
];

export const handler: Handler = async (event) => {
  const path = event.path.replace(/\/\.netlify\/functions\/gemini/, "").replace(/\/api/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  const apiKey = getApiKey();
  if (!apiKey) {
    return errorResponse(503, "API key is not configured. Please add your GEMINI_API_KEY in environment variables.");
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    // 1. Content Generation
    if (normalizedPath === "/generate-content") {
      if (event.httpMethod !== "POST") return errorResponse(405, "Method not allowed. Expected POST.");
      const body = event.body ? JSON.parse(event.body) : {};
      const params = { ...body, model: resolveModel(body?.model) };
      const response = await ai.models.generateContent(params);
      return jsonResponse(200, response);
    }

    // 2. Chat Message
    if (normalizedPath === "/chat-message") {
      if (event.httpMethod !== "POST") return errorResponse(405, "Method not allowed. Expected POST.");
      const body = event.body ? JSON.parse(event.body) : {};
      const { model, config, history, message, msgConfig } = body;
      const chat = ai.chats.create({
        model: resolveModel(model),
        config,
        history,
      });
      const response = await chat.sendMessage({ message, config: msgConfig });
      return jsonResponse(200, response);
    }

    // 3. Image Generation
    if (normalizedPath === "/generate-images") {
      if (event.httpMethod !== "POST") return errorResponse(405, "Method not allowed. Expected POST.");
      const body = event.body ? JSON.parse(event.body) : {};
      const response = await ai.models.generateImages(body);
      return jsonResponse(200, response);
    }

    // 4. Video Download (with strict domain validation and SSRF prevention)
    if (normalizedPath === "/video-download") {
      if (event.httpMethod !== "GET") return errorResponse(405, "Method not allowed. Expected GET.");
      const rawUri = String(event.queryStringParameters?.uri || "").split("&key=")[0];
      if (!rawUri) return errorResponse(400, "Missing uri parameter.");

      try {
        const parsedUrl = new URL(rawUri);
        const isAllowed = ALLOWED_VIDEO_HOSTS.some(
          (allowed) => parsedUrl.hostname === allowed || parsedUrl.hostname.endsWith(`.${allowed}`)
        );

        if (!isAllowed) {
          return errorResponse(403, "Untrusted destination host. Video downloads are restricted to authorized domains.");
        }

        const sep = rawUri.includes("?") ? "&" : "?";
        const downloadUrl = `${rawUri}${sep}key=${apiKey}`;
        const upstream = await fetch(downloadUrl);

        if (!upstream.ok) {
          return errorResponse(upstream.status, `Upstream fetch error: ${upstream.statusText}`);
        }

        const contentType = upstream.headers.get("content-type") || "video/mp4";
        const arrayBuf = await upstream.arrayBuffer();
        const base64Data = Buffer.from(arrayBuf).toString("base64");

        return {
          statusCode: 200,
          isBase64Encoded: true,
          headers: {
            "Content-Type": contentType,
            "Cache-Control": "public, max-age=86400",
          },
          body: base64Data,
        };
      } catch (urlErr: any) {
        return errorResponse(400, "Malformed URL passed in uri parameter.");
      }
    }

    return errorResponse(404, `Gemini endpoint '${normalizedPath}' is not supported.`);
  } catch (err: any) {
    console.error("[Netlify Function] Gemini proxy error:", err);
    return errorResponse(500, err?.message || "Internal serverless error processing AI request.");
  }
};
