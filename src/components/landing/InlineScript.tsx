// Emits a script that runs synchronously during HTML parsing (before first paint).
// On the client the type is swapped to text/plain so React doesn't warn about rendering <script>.
export default function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === 'undefined' ? 'text/javascript' : 'text/plain'}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
