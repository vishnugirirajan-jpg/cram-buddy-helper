import { useEffect, useState } from "react";
import { loadProActive } from "@/lib/rewards";

export function usePro() {
  const [active, setActive] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setActive(loadProActive());
    setReady(true);
  }, []);
  return { active, ready };
}