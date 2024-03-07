import ButtonAccount from "@/components/ButtonAccount";
import Wai from "@/components/Wai";

export const dynamic = "force-dynamic";

// This is a private page: It's protected by the layout.js component which ensures the user is authenticated.
// It's a server component which means you can fetch data (like the user profile) before the page is rendered.
// See https://shipfa.st/docs/tutorials/private-page
export default async function Dashboard() {
  return (
    <main className="min-h-screen flex flex-col">
      <section className="flex flex-col min-h-[calc(100dvh)] max-w-7xl w-full mx-auto">
        <header className="flex items-center justify-end p-4 border-b border-gray-200">
        <ButtonAccount />
        </header>
        
        <Wai />
      </section>
    </main>
  );
}
