"use client";

import { useEffect, useState } from "react"

import { createClient } from "@/libs/supabase-client";
import { useGetUser } from "@/hooks";

import ButtonAccount from "@/components/ButtonAccount";
import ButtonSelectPerson from "@/components/ButtonSelectPerson";
import Wai from "@/components/Wai";

//export const dynamic = "force-dynamic";

// This is a private page: It's protected by the layout.js component which ensures the user is authenticated.
// It's a server component which means you can fetch data (like the user profile) before the page is rendered.
// See https://shipfa.st/docs/tutorials/private-page
export default function Talk() {
  const [currentCallerId, setCurrentCallerId] = useState<string | null>(null);
  const supabase = createClient();
  const user = useGetUser();

  useEffect(() => {
    async function fetchData() {

      const { data: lastCall } = await supabase
        .from("calls")
        .select("*")
        .eq("user_id", user.id)
        .not("current_caller_id", "is", null)
        .order("ended_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      setCurrentCallerId(lastCall?.current_caller_id);
    }

    if (user) {
      fetchData();
    }
  }, [user]);
  
  return (
    <main className="flex flex-col">
      <section className="flex flex-col min-h-[calc(100dvh)] max-w-7xl w-full mx-auto">
        <header className="flex items-center justify-end p-4">
          <ButtonSelectPerson lastCallerId={currentCallerId} onChange={(e) => {setCurrentCallerId(e.target.value);}} />
          <ButtonAccount />
        </header>

        <Wai callerId={currentCallerId} />
      </section>
    </main>
  );
}
