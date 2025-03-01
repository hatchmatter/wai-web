import React from 'react';

type AccordionProps = {
  children: React.ReactNode;
  className?: string;
};

export function Accordion({ children, className }: AccordionProps) {
  return <div className={`join join-vertical w-full ${className}`}>{children}</div>;
}

type AccordionItemProps = {
  title: string | React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
};

export function AccordionItem({ title, children, onClick }: AccordionItemProps) {
  return (
    <div className="collapse collapse-plus join-item border border-base-300">
      <input type="radio" name="accordion-item" onClick={onClick} />
      <div className="collapse-title text-lg font-medium">{title}</div>
      <div className="collapse-content">{children}</div>
    </div>
  );
}
