import { type EmailOtpType } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/libs/supabase-server";
import config from "@/config";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);

  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    // For OAuth
    if (code) {
      const response = await supabase.auth.exchangeCodeForSession(code);
      const { data, error } = response;

      if (error) throw error;

      return handlePostAuthentication(data.user, origin, code, type);
    }

    // For Magic Link
    if (token_hash && type) {
      const response = await supabase.auth.verifyOtp({
        type,
        token_hash,
      });

      const { data, error } = response;

      if (error) throw error;

      return handlePostAuthentication(data.user, origin, token_hash, type);
    }

    throw new Error(
      "Something went wrong while signing in! Please try again or contact support if the issue persists."
    );
  } catch (error) {
    console.error(error);

    // Redirect back to login page with error message
    const redirectTo = request.nextUrl.clone();
    redirectTo.pathname = config.auth.loginUrl;

    redirectTo.searchParams.delete("code");
    redirectTo.searchParams.delete("token_hash");
    redirectTo.searchParams.delete("type");

    redirectTo.searchParams.set("error", error.message);

    return NextResponse.redirect(redirectTo);
  }
}

// Checks whether the user has already accepted the beta terms and conditions
async function handlePostAuthentication(user: any, origin: string, token: any = null, type: any = null) {
  const supabase = createClient(cookies());

  // Check if the user has agreed to beta terms
  const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('agreed_to_beta_terms')
      .eq('id', user.id)
      .maybeSingle();

  if (profileError) throw profileError;

  if (!profile || !profile.agreed_to_beta_terms) {
      // Redirect to the confirm-invite route if they have not agreed to the terms
      return NextResponse.redirect(`${origin}/beta-terms?token=${token}&type=${type}`);
  }

  // Continue to callback URL if terms are agreed
  return NextResponse.redirect(`${origin}${config.auth.callbackUrl}`);
}