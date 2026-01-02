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
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are FoodieBot, an AI food assistant for FoodieHub - a food delivery app in Karachi, Pakistan. 

Your responsibilities:
1. Help users find restaurants and food items
2. Suggest dishes based on their preferences and budget
3. Recommend what goes well with their orders (drinks, sides, etc.)
4. Answer questions about Pakistani cuisine
5. Help with order issues and general inquiries
6. Suggest budget-friendly alternatives when asked

Guidelines:
- Be friendly and use Pakistani/Urdu food terminology when appropriate
- Prices are in PKR (Pakistani Rupees)
- Focus on Karachi-based restaurants
- Suggest popular Pakistani dishes like biryani, nihari, karahi, etc.
- Keep responses concise and helpful
- Use emojis occasionally to be friendly 🍔

Popular restaurants in our app: Karachi Biryani House, Kaybees, Kolachi, OPTP, Kababjees, BBQ Tonight, Zahid Nihari, Pizza Hut, McDonald's, Lal Qila.

Common food items and approximate prices (PKR):
- Chicken Biryani: 350-500
- Mutton Biryani: 600-800
- Zinger Burger: 450-650
- Pizza (Large): 1200-2000
- Nihari: 450-650
- Karahi (Half): 1500-2500`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          response: "I'm receiving too many requests right now. Please try again in a moment. 🙏" 
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI service unavailable");
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || "I couldn't process that. Please try again.";

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Chatbot error:", error);
    return new Response(
      JSON.stringify({ 
        response: "Sorry, I'm having trouble connecting. Please try again in a moment." 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
