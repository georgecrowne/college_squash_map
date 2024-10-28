import React, { PropsWithChildren } from "react";

type Props = {
  className?: string;
  centered?: boolean;
  level?: 1;
};

export function Heading({
  children,
  className: extraClassName,
  centered = false,
  level = 1,
  ...props
}: PropsWithChildren<Props>) {
  const Tag = `h${level}`;

  let className = "tracking-tight leading-none mt-0 ";

  switch (level) {
    case 1:
      className += "text-2xl font-bold ";
      break;
  }

  if (extraClassName) {
    className += " " + extraClassName;
  }

  if (centered) {
    className += " text-center w-full";
  }

  return React.createElement(Tag, { className, ...props }, children);
}
