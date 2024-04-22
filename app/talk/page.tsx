"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/libs/supabase-client";
import { useGetUser } from "@/hooks";

import ButtonAccount from "@/components/ButtonAccount";
import ButtonSelectPerson from "@/components/ButtonSelectPerson";
import Wai from "@/components/Wai";

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
          <ButtonSelectPerson
            lastCallerId={currentCallerId}
            onChange={(e) => {
              setCurrentCallerId(e.target.value);
            }}
          />
          <ButtonAccount />
        </header>

        <Wai callerId={currentCallerId} />
      </section>
    </main>
  );
}
