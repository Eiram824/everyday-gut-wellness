import type { Handler } from "@netlify/functions";

export const handler: Handler = async (event) => {
  return {
    statusCode: 404,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
    body: JSON.stringify({
      success: false,
      error: `API endpoint '${event.path}' was not found.`,
      status: 404,
    }),
  };
};
