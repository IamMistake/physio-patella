import { Box, Typography } from "@mui/material";

type SectionOverlineProps = {
  children: string;
  withLeadingLine?: boolean;
  letterSpacing?: string;
};

export default function SectionOverline({
  children,
  withLeadingLine = false,
  letterSpacing = "0.16em",
}: SectionOverlineProps) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: withLeadingLine ? 1 : 0 }}>
      {withLeadingLine ? (
        <Box sx={{ width: 24, height: 1.5, bgcolor: "primary.main", flexShrink: 0 }} />
      ) : null}
      <Typography
        sx={{
          fontSize: "0.7rem",
          letterSpacing,
          color: "primary.main",
          fontWeight: 500,
          textTransform: "uppercase",
        }}
      >
        {children}
      </Typography>
    </Box>
  );
}
