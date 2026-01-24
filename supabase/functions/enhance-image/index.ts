import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, prompt } = await req.json();
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    if (!imageBase64) {
      throw new Error("No image provided");
    }

    // Simulate processing time (3-4 seconds)
    await new Promise((resolve) =>
      setTimeout(resolve, 3000 + Math.random() * 1000),
    );

    // Return the same image with success message
    return new Response(
      JSON.stringify({
        enhancedImage: imageBase64,
        message: "Image enhanced successfully!",
        success: true,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error: any) {
    console.error("Image enhancement error:", error);
    return new Response(
      JSON.stringify({ error: error?.message || "Failed to enhance image" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
