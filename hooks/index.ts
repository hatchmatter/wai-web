import { useEffect, useState } from 'react';
import { createClient } from '@/libs/supabase-client';

export function useGetUser() {
  const supabase = createClient();
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    }

    getUser();
  }, []);

  return user;
}
