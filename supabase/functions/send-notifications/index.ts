import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NotificationPayload {
  type: 'order_delivered' | 'earnings_credited' | 'withdrawal_completed' | 'tax_bill_generated' | 'account_locked';
  user_id: string;
  data: Record<string, any>;
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const payload: NotificationPayload = await req.json();
    const { type, user_id, data } = payload;

    console.log(`Processing notification: ${type} for user ${user_id}`);

    // Get user email
    const { data: profile } = await supabase
      .from("profiles")
      .select("email, name")
      .eq("user_id", user_id)
      .single();

    if (!profile?.email) {
      console.log("No email found for user");
      return new Response(
        JSON.stringify({ success: false, message: "No email found" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If no Resend API key, just log and return
    if (!resendApiKey) {
      console.log(`Email would be sent to ${profile.email} for ${type}:`, data);
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Email notification logged (RESEND_API_KEY not configured)",
          would_send_to: profile.email,
          type,
          data
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Prepare email content based on notification type
    let subject = "";
    let htmlContent = "";
    const userName = profile.name || profile.email.split("@")[0];

    switch (type) {
      case "order_delivered":
        subject = "🎉 Your order has been delivered!";
        htmlContent = `
          <h1>Hi ${userName}!</h1>
          <p>Great news! Your order has been successfully delivered.</p>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Order ID:</strong> ${data.order_id?.slice(0, 8).toUpperCase()}</p>
            <p><strong>Restaurant:</strong> ${data.restaurant_name || 'N/A'}</p>
            <p><strong>Total:</strong> Rs. ${data.total_amount?.toLocaleString() || '0'}</p>
          </div>
          <p>Thank you for ordering with FoodieHub!</p>
          <p>We hope you enjoy your meal 😋</p>
        `;
        break;

      case "earnings_credited":
        subject = "💰 Earnings credited to your wallet!";
        htmlContent = `
          <h1>Hi ${userName}!</h1>
          <p>Great news! Your earnings have been credited.</p>
          <div style="background: #e8f5e9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Amount Credited:</strong> Rs. ${data.amount?.toLocaleString() || '0'}</p>
            <p><strong>Order Reference:</strong> ${data.order_id?.slice(0, 8).toUpperCase() || 'N/A'}</p>
            <p><strong>New Wallet Balance:</strong> Rs. ${data.new_balance?.toLocaleString() || '0'}</p>
          </div>
          <p>Keep up the great work!</p>
        `;
        break;

      case "withdrawal_completed":
        subject = "✅ Withdrawal completed successfully!";
        htmlContent = `
          <h1>Hi ${userName}!</h1>
          <p>Your withdrawal has been processed successfully.</p>
          <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Amount:</strong> Rs. ${data.amount?.toLocaleString() || '0'}</p>
            <p><strong>Method:</strong> ${data.method || 'N/A'}</p>
            <p><strong>Account:</strong> ${data.account_number || 'N/A'}</p>
          </div>
          <p>The funds should reflect in your account within 24-48 hours.</p>
        `;
        break;

      case "tax_bill_generated":
        subject = "📋 Tax bill generated - Action required";
        htmlContent = `
          <h1>Hi ${userName}!</h1>
          <p>A new tax bill has been generated for your recent withdrawal.</p>
          <div style="background: #fff3e0; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Tax Amount:</strong> Rs. ${data.tax_amount?.toLocaleString() || '0'}</p>
            <p><strong>Due Date:</strong> ${data.due_date || '30 days from now'}</p>
          </div>
          <p style="color: #f57c00;"><strong>⚠️ Important:</strong> Please pay this tax within 30 days to avoid account restrictions.</p>
          <p>Visit your Earnings Dashboard to view and pay your tax bills.</p>
        `;
        break;

      case "account_locked":
        subject = "🔒 Account locked - Immediate action required";
        htmlContent = `
          <h1>Hi ${userName}!</h1>
          <p style="color: #d32f2f;"><strong>Your account has been locked</strong> due to unpaid tax obligations.</p>
          <div style="background: #ffebee; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Outstanding Amount:</strong> Rs. ${data.outstanding_amount?.toLocaleString() || '0'}</p>
            <p><strong>Overdue Bills:</strong> ${data.overdue_bills || '1'}</p>
          </div>
          <p>To restore access to your account, please clear all outstanding tax dues immediately.</p>
          <p>Visit your Earnings Dashboard to make payment.</p>
        `;
        break;

      default:
        console.log(`Unknown notification type: ${type}`);
        return new Response(
          JSON.stringify({ success: false, message: "Unknown notification type" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    // Send email via Resend
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "FoodieHub <notifications@resend.dev>",
        to: [profile.email],
        subject,
        html: htmlContent,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error("Resend error:", errorText);
      throw new Error(`Failed to send email: ${errorText}`);
    }

    const result = await emailResponse.json();
    console.log("Email sent successfully:", result);

    return new Response(
      JSON.stringify({ success: true, email_id: result.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in send-notifications:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
