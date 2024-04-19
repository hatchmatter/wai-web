"use client";

import React, { ChangeEventHandler, useEffect, useState } from "react";

import { createClient } from "@/libs/supabase-client";
import { useGetUser } from "@/hooks";

type ButtonPersonProps = {
  lastCallerId: string;
  onChange: ChangeEventHandler<HTMLSelectElement>;
};

const ButtonSelectPerson = ({ lastCallerId, onChange }: ButtonPersonProps) => {
  const supabase = createClient();
  const [callers, setCallers] = useState([]);
  const user = useGetUser();

  useEffect(() => {
    async function fetchData() {
      const { data, error } = await supabase
        .from("callers")
        .select("*")
        .eq("user_id", user?.id);

      if (error) {
        console.error("Error fetching callers:", error);
        return;
      }

      setCallers(data);
    }

    if (user) {
      fetchData();
    }
  }, [user]);

  return (
    <>
      <div className="flex-grow flex justify-center">
        {callers.length > 0 && (
          <select
            className="select select-bordered max-w-xs w-30"
            defaultValue={lastCallerId}
            onChange={onChange}
          >
            {callers.map((caller) => (
              <option key={caller.id} value={caller.id}>
                {caller.name}
              </option>
            ))}
          </select>
        )}
      </div>
    </>
  );
};

export default ButtonSelectPerson;
