import Link from "next/link";
import Icon, { type IconName } from "./Icon";

interface Props {
  icon: IconName;
  title: string;
  /** Optional small count chip after the title (e.g. "12 offerte"). */
  badge?: string;
  badgeTone?: "accent" | "sale";
  /** Optional "see all" link on the right. */
  href?: string;
  linkLabel?: string;
}

/**
 * Consistent section header: an icon in a tinted square, a display-font title,
 * an optional count chip, and an optional right-aligned link. Replaces the
 * ad-hoc emoji + heading + link blocks that were copy-pasted per section.
 */
export default function SectionHeader({
  icon,
  title,
  badge,
  badgeTone = "accent",
  href,
  linkLabel = "Vedi tutti",
}: Props) {
  const badgeStyle =
    badgeTone === "sale"
      ? { color: "var(--sale)", backgroundColor: "var(--sale-quiet)" }
      : { color: "var(--accent)", backgroundColor: "var(--accent-quiet)" };

  return (
    <div className="flex items-end justify-between gap-4 mb-6">
      <div className="flex items-center gap-3">
        <span
          className="grid place-items-center w-9 h-9 rounded-xl shrink-0"
          style={{ color: "var(--accent)", backgroundColor: "var(--accent-quiet)" }}
        >
          <Icon name={icon} size={18} />
        </span>
        <h2 className="text-[length:var(--step-1)] font-semibold leading-none">
          {title}
        </h2>
        {badge && (
          <span
            className="text-xs font-medium px-2 py-0.5 rounded-full"
            style={badgeStyle}
          >
            {badge}
          </span>
        )}
      </div>
      {href && (
        <Link
          href={href}
          className="group inline-flex items-center gap-1 text-sm shrink-0 transition-colors"
          style={{ color: "var(--accent)" }}
        >
          {linkLabel}
          <Icon
            name="arrow-right"
            size={15}
            className="transition-transform group-hover:translate-x-0.5"
          />
        </Link>
      )}
    </div>
  );
}
