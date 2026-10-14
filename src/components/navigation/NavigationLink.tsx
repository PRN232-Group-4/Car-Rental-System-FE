"use client";

import { forwardRef, useImperativeHandle, useRef, type ComponentPropsWithoutRef } from "react";
import NextLink from "next/link";
import { useNavigationLoading } from "./NavigationProvider";

/** Use Next's navigation event so downloads, new tabs and cancelled clicks are ignored. */
const NavigationLink = forwardRef<HTMLAnchorElement, ComponentPropsWithoutRef<typeof NextLink>>(
  function NavigationLink({ onNavigate, ...props }, ref) {
    const anchor = useRef<HTMLAnchorElement>(null);
    const { begin } = useNavigationLoading();
    useImperativeHandle(ref, () => anchor.current!);

    return (
      <NextLink
        {...props}
        ref={anchor}
        onNavigate={(event) => {
          let cancelled = false;
          onNavigate?.({
            preventDefault: () => {
              cancelled = true;
              event.preventDefault();
            },
          });
          if (!cancelled && anchor.current) begin(anchor.current.href);
        }}
      />
    );
  },
);

export default NavigationLink;
