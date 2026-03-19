"use client";

import * as React from "react";
import { Box } from "@mui/material";

export default function ReadingProgress() {
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const scrollHeight = document.body.scrollHeight - window.innerHeight;

      if (scrollHeight <= 0) {
        setProgress(0);
        return;
      }

      const ratio = Math.min(Math.max(scrollTop / scrollHeight, 0), 1);
      setProgress(ratio * 100);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <Box
      sx={{
        position: "fixed",
        top: { xs: "56px", md: "64px" },
        left: 0,
        height: "3px",
        bgcolor: "primary.main",
        zIndex: 1100,
        transition: "width 0.1s linear",
      }}
      style={{ width: `${progress}%` }}
      aria-hidden
    />
  );
}
