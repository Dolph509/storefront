import { createElement, type SVGProps } from "react";
import { emptyStateMetrics } from "./metrics.generated";
import { type EmptyStateName, emptyStatePaths } from "./paths.generated";

export type EmptyStateIllustrationProps = Omit<
  SVGProps<SVGSVGElement>,
  "name"
> & {
  name: EmptyStateName;
  size?: number | string;
  title?: string;
};

export function EmptyStateIllustration({
  name,
  size = 80,
  title,
  ...props
}: EmptyStateIllustrationProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={emptyStateMetrics[name]?.viewBox ?? "0 0 64 64"}
      width={size}
      height={size}
      fill="none"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth={emptyStateMetrics[name]?.strokeWidth ?? "2.25"}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {emptyStatePaths[name].map((node, index) =>
          createElement(node.tag, { ...node.props, key: index }),
        )}
      </g>
    </svg>
  );
}

export type { EmptyStateName } from "./paths.generated";
export { emptyStateNames } from "./paths.generated";
