import type { SVGProps } from "react";

/**
 * Small consistent line-icon set (1.5px stroke, currentColor) used for section
 * markers and inline affordances. Replaces the emoji-as-scaffold pattern so the
 * UI reads as crafted rather than decorated.
 */

type IconName =
  | "spark"
  | "tag"
  | "book"
  | "spool"
  | "arrow-right"
  | "external"
  | "search"
  | "sliders"
  | "grid"
  | "rows"
  | "check"
  | "x"
  | "chevron-right"
  | "menu";

const PATHS: Record<IconName, React.ReactNode> = {
  spark: (
    <path d="M12 3v4m0 10v4m9-9h-4M7 12H3m13.5-5.5-2.8 2.8M9.3 14.7l-2.8 2.8m11 0-2.8-2.8M9.3 9.3 6.5 6.5" />
  ),
  tag: (
    <>
      <path d="M3.5 11.2 11 3.7a2 2 0 0 1 1.4-.6H19a2 2 0 0 1 2 2v6.6a2 2 0 0 1-.6 1.4l-7.5 7.5a2 2 0 0 1-2.8 0l-6.6-6.6a2 2 0 0 1 0-2.8Z" />
      <circle cx="16.5" cy="7.5" r="1.3" />
    </>
  ),
  book: (
    <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H12v15H5.5A1.5 1.5 0 0 0 4 20.5ZM20 5.5A1.5 1.5 0 0 0 18.5 4H12v15h6.5A1.5 1.5 0 0 1 20 20.5Z" />
  ),
  spool: (
    <>
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <path d="M8 5v14M16 5v14" />
      <path d="M8 9.5h8M8 14.5h8" />
    </>
  ),
  "arrow-right": <path d="M5 12h14m-6-6 6 6-6 6" />,
  external: <path d="M14 5h5v5M19 5l-8 8M19 13v4a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4" />,
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-3.5-3.5" />
    </>
  ),
  sliders: <path d="M4 7h11m2 0h3M4 17h3m2 0h11M15 4v6M9 14v6" />,
  grid: (
    <>
      <rect x="4" y="4" width="7" height="7" rx="1.5" />
      <rect x="13" y="4" width="7" height="7" rx="1.5" />
      <rect x="4" y="13" width="7" height="7" rx="1.5" />
      <rect x="13" y="13" width="7" height="7" rx="1.5" />
    </>
  ),
  rows: (
    <>
      <rect x="4" y="5" width="16" height="4" rx="1.5" />
      <rect x="4" y="11" width="16" height="4" rx="1.5" />
      <rect x="4" y="17" width="16" height="2.5" rx="1.25" />
    </>
  ),
  check: <path d="m5 13 4 4L19 7" />,
  x: <path d="m6 6 12 12M18 6 6 18" />,
  "chevron-right": <path d="m9 6 6 6-6 6" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
};

interface Props extends SVGProps<SVGSVGElement> {
  name: IconName;
  size?: number;
}

export default function Icon({ name, size = 20, className, ...rest }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
      {...rest}
    >
      {PATHS[name]}
    </svg>
  );
}

export type { IconName };
