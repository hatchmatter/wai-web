import Image from "next/image";
import ButtonLead from "@/components/ButtonLead";
import config from "@/config";

const Hero = () => {
  return (
    <section className="max-w-7xl mx-auto bg-base-100 flex flex-col lg:flex-row items-center justify-center gap-16 lg:gap-20 px-8 py-8 lg:py-20">
      <div className="flex flex-col gap-10 lg:gap-14 items-center justify-center text-center lg:text-left lg:items-start">
        <h1 className="font-extrabold text-4xl lg:text-6xl tracking-tight md:-mb-4">
          Kid-friendly AI assistant for parents
        </h1>
        <p className="text-lg opacity-80 leading-relaxed">
          {config.appDescription}
        </p>
        <p className="font-bold">
          Wai is currently in private beta. Join the waitlist to get in the
          queue for public beta.
        </p>
        <ButtonLead />
      </div>
      <div className="lg:w-full">
        <Image
          src="/wai-in-garden.jpeg"
          alt="Wai teaching in a garden"
          className="w-full rounded-xl"
          priority={true}
          width={500}
          height={500}
        />
      </div>
    </section>
  );
};

export default Hero;
