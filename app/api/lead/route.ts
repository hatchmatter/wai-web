import { createClient } from "@/libs/supabase-server";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

// This route is used to store the leads that are generated from the landing page.
// The API call is initiated by <ButtonLead /> component
export async function POST(req: NextRequest) {
  const body = await req.json();

  if (!body.email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const { error } = await supabase
      .from("leads")
      .insert({ email: body.email });

    if (error) {
      console.error("Error inserting lead:", error);
      return NextResponse.json(
        {
          error:
            "There was a problem adding your email. You may have already signed up using this email address.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json({}, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
