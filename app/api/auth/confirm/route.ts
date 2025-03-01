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
  const agreedToBetaTerms = searchParams.get('agreed_to_beta_terms');

  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    // For OAuth
    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) throw error;

      return NextResponse.redirect(`${origin}${config.auth.callbackUrl}`);
    }

    // For Invites
    if (token_hash && type) {
      if (!agreedToBetaTerms) throw new Error("You have not agreed to the terms");

      const { data, error } = await supabase.auth.verifyOtp({
        type,
        token_hash,
      });

      if (error) throw error;

      const { error: profileError } = await supabase
        .from("profiles")
        .insert({
          id: data.user.id,
          agreed_to_beta_terms: true
        });

      if (profileError) throw profileError;

      return NextResponse.redirect(`${origin}${config.auth.callbackUrl}`);
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