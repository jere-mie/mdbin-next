"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

export default function AdminEasterEgg() {
  const [clicks, setClicks] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

  const handleClick = useCallback(() => {
    const next = clicks + 1;
    setClicks(next);

    if (timerRef.current) clearTimeout(timerRef.current);

    if (next >= 5) {
      setClicks(0);
      router.push("/admin/login");
      return;
    }

    timerRef.current = setTimeout(() => {
      setClicks(0);
    }, 2000);
  }, [clicks, router]);

  return (
    <span
      onClick={handleClick}
      style={{ cursor: "default", userSelect: "none" }}
      role="button"
      tabIndex={-1}
    >
      password
    </span>
  );
}
