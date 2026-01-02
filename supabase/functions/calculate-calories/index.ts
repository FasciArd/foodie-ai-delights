import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { foodName, description, imageBase64 } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let prompt = `You are a nutrition expert. Estimate the calories for this food item.

Food Name: ${foodName}
${description ? `Description: ${description}` : ''}

Provide ONLY a JSON response in this exact format (no markdown, no explanation):
{"calories": <number>, "breakdown": {"protein": "<grams>g", "carbs": "<grams>g", "fat": "<grams>g"}, "confidence": "<low|medium|high>"}

Base your estimate on typical Pakistani serving sizes. Be accurate and realistic.`;

    const messages: any[] = [{ role: "user", content: prompt }];

    // If image is provided, use multimodal
    if (imageBase64) {
      messages[0] = {
        role: "user",
        content: [
          { type: "text", text: prompt + "\n\nAnalyze the food image provided to give a more accurate estimate." },
          {
            type: "image_url",
            image_url: {
              url: imageBase64.startsWith("data:") ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`,
            },
          },
        ],
      };
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { 
            role: "system", 
            content: "You are a nutrition expert. Always respond with valid JSON only, no markdown or explanations." 
          },
          ...messages,
        ],
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: "Rate limit exceeded. Please try again later.",
          calories: null 
        }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI service unavailable");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    // Parse the JSON response
    let result;
    try {
      // Clean up potential markdown formatting
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
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
    return new Response(
      JSON.stringify({ 
        error: error?.message || "Failed to calculate calories",
        calories: null 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
