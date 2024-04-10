type SectionProps = {
  children: React.ReactNode;
};

export function Section({ children }: SectionProps) {
  return (
    <div className="grid grid-cols-1 gap-x-8 gap-y-10 px-4 py-16 sm:px-6 md:grid-cols-3 lg:px-8">
      {children}
    </div>
  );
}

export function SectionDescription({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}

export function SectionContent({ children }: { children: React.ReactNode }) {
  return <div className="md:col-span-2">{children}</div>;
}