import config from "@/config";
import { createClient } from "@/libs/supabase-server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

// This is a server-side component to ensure the user is logged in.
// If not, it will redirect to the login page.
// It's applied to all subpages of /dashboard in /app/dashboard/*** pages
// You can also add custom static UI elements like a Navbar, Sidebar, Footer, etc..
// See https://shipfa.st/docs/tutorials/private-page
export default async function LayoutPrivate({
  children,
}: {
  children: ReactNode;
}) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(config.auth.loginUrl);
  }

  return <>{children}</>;
}