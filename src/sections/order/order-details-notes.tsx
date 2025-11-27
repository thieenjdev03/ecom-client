import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import CardHeader from "@mui/material/CardHeader";

// ----------------------------------------------------------------------

type Props = {
  notes?: string | null;
  internalNotes?: string | null;
};

export default function OrderDetailsNotes({ notes, internalNotes }: Props) {
  if (!notes && !internalNotes) {
    return null;
  }

  const renderNote = (label: string, value: string) => (
    <Stack key={label} spacing={0.5}>
      <Typography variant="caption" sx={{ color: "text.secondary" }}>
        {label}
      </Typography>
      <Typography variant="body2">{value}</Typography>
    </Stack>
  );

  return (
    <Card>
      <CardHeader title="Notes" />
      <Stack spacing={2} sx={{ p: 3 }}>
        {notes && renderNote("Customer note", notes)}
        {internalNotes && renderNote("Internal note", internalNotes)}
      </Stack>
    </Card>
  );
}

