type AccordionProps = {
  children: React.ReactNode;
  className?: string;
};

export function Accordion({ children, className }: AccordionProps) {
  return <div className={`join join-vertical w-full ${className}`}>{children}</div>;
}

type AccordionItemProps = {
  title: string;
  children: React.ReactNode;
};

export function AccordionItem({ title, children }: AccordionItemProps) {
  return (
    <div className="collapse collapse-arrow join-item">
      <input type="radio" name="accordion-item" />
      <div className="collapse-title text-lg font-medium">{title}</div>
      <div className="collapse-content">{children}</div>
    </div>
  );
}
