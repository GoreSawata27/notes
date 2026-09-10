import { Fragment, type ReactNode } from "react";

export function InlineMd({ text }: { text: string }) {
  const parts: ReactNode[] = [];
  const re = /(`[^`]+`|\*\*[^*]+\*\*)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = re.exec(text))) {
    if (match.index > last) {
      parts.push(<Fragment key={key}>{text.slice(last, match.index)}</Fragment>);
      key += 1;
    }
    const token = match[0];
    if (token.startsWith("`")) {
      parts.push(<code key={key}>{token.slice(1, -1)}</code>);
    } else {
      parts.push(<strong key={key}>{token.slice(2, -2)}</strong>);
    }
    key += 1;
    last = match.index + token.length;
  }

  if (last < text.length) {
    parts.push(<Fragment key={key}>{text.slice(last)}</Fragment>);
  }
  return <>{parts}</>;
}
