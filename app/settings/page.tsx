import ButtonBack from "@/components/ButtonBack";
import SettingsWai from "@/components/SettingsWai";
import CallHistory from "@/components/CallHistory";
import Callers from "@/components/Callers";

export const dynamic = "force-dynamic";

export default async function Settings() {
  return (
    <main className="max-w-6xl m-auto pt-16">
      <ButtonBack href="/talk">Talk</ButtonBack>
      <h1 className="text-3xl font-semibold leading-9 text-center">Settings</h1>
      <div className="divide-y divide-black/5">
        <SettingsWai />
      </div>
      <div className="divide-y divide-black/5">
        <Callers />
      </div>
      <div className="divide-y divide-black/5">
        <CallHistory />
      </div>
    </main>
  );
}
