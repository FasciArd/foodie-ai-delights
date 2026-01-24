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
    const { foodName, description, imageBase64 } = await req.json();
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

    // Basic input validation
    if (!foodName || typeof foodName !== "string" || !foodName.trim()) {
      return new Response(
        JSON.stringify({
          error: "Missing food name",
          calories: null,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Handle missing API key gracefully (do not throw 500)
    if (!GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({
          error: "GEMINI_API_KEY is not configured",
          calories: null,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    let prompt = `You are a nutrition expert. Estimate the calories for this food item.

Food Name: ${foodName}
${description ? `Description: ${description}` : ""}

Provide ONLY a JSON response in this exact format (no markdown, no explanation):
{"calories": <number>, "breakdown": {"protein": "<grams>g", "carbs": "<grams>g", "fat": "<grams>g"}, "confidence": "<low|medium|high>"}

Base your estimate on typical Pakistani serving sizes. Be accurate and realistic.`;

    const messages: any[] = [{ role: "user", content: prompt }];

    // If image is provided, use multimodal
    if (imageBase64) {
      messages[0] = {
        role: "user",
        content: [
          {
            type: "text",
            text:
              prompt +
              "\n\nAnalyze the food image provided to give a more accurate estimate.",
          },
          {
            type: "image_url",
            image_url: {
              url: imageBase64.startsWith("data:")
                ? imageBase64
                : `data:image/jpeg;base64,${imageBase64}`,
            },
          },
        ],
      };
    }

    let parts: any[] = [{ text: prompt }];

    // If image is provided, use vision model
    if (imageBase64) {
      const base64Data = imageBase64.startsWith("data:")
        ? imageBase64.split(",")[1]
        : imageBase64;

      parts.push({
        inline_data: {
          mime_type: "image/jpeg",
          data: base64Data,
        },
      });
    }

    // Use a single multimodal-capable model (supports text + images)
    const model = "gemini-2.5-flash";
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: {
            temperature: 0.4,
            topK: 32,
            topP: 1,
            maxOutputTokens: 512,
          },
        }),
      },
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({
            error: "Rate limit exceeded. Please try again later.",
            calories: null,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      const errorText = await response.text();
      return new Response(
        JSON.stringify({
          error: `AI service unavailable: ${errorText || response.status}`,
          calories: null,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Parse the JSON response
    let result;
    try {
      // Clean up potential markdown formatting
      const cleanContent = content
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      result = JSON.parse(cleanContent);
    } catch {
      // If parsing fails, try to extract calories from text
      const match = content.match(/(\d+)\s*(?:calories|kcal)/i);
      result = {
        calories: match ? parseInt(match[1]) : 500,
        breakdown: { protein: "N/A", carbs: "N/A", fat: "N/A" },
        confidence: "low",
      };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Calorie calculation error:", error);
    // Return 200 with error payload so client can handle gracefully
    return new Response(
      JSON.stringify({
        error: error?.message || "Failed to calculate calories",
        calories: null,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
