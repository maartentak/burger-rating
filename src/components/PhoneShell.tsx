/**
 * Wraps a screen so it looks native full-bleed on phones, and sits in a
 * playful phone frame (hard offset shadow, rounded corners) on wider screens.
 */
export function PhoneShell({
  children,
  bg = "#F6F1E5",
}: {
  children: React.ReactNode;
  bg?: string;
}) {
  return (
    <div
      className="flex min-h-[100dvh] w-full justify-center sm:items-center sm:py-8"
      style={{ background: "#EAE3D3" }}
    >
      <div
        className="relative flex min-h-[100dvh] w-full flex-col overflow-hidden sm:h-[812px] sm:min-h-0 sm:max-w-[390px] sm:rounded-[48px] sm:border-[3px] sm:border-ink sm:shadow-frame"
        style={{ background: bg }}
      >
        {children}
      </div>
    </div>
  );
}
