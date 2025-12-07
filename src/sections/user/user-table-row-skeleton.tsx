import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";

// ----------------------------------------------------------------------

export default function UserTableRowSkeleton() {
  return (
    <TableRow hover>
      {/* Checkbox */}
      <TableCell padding="checkbox">
        <Skeleton variant="rectangular" width={18} height={18} sx={{ borderRadius: 0.5 }} />
      </TableCell>

      {/* Name with Avatar */}
      <TableCell>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Skeleton variant="circular" width={40} height={40} />
          <Stack spacing={0.5}>
            <Skeleton variant="text" width={120} height={20} />
            <Skeleton variant="text" width={160} height={14} />
          </Stack>
        </Stack>
      </TableCell>

      {/* Email */}
      <TableCell>
        <Skeleton variant="text" width={180} height={20} />
      </TableCell>

      {/* Country */}
      <TableCell>
        <Skeleton variant="text" width={100} height={20} />
      </TableCell>

      {/* Phone */}
      <TableCell>
        <Skeleton variant="text" width={120} height={20} />
      </TableCell>

      {/* Role */}
      <TableCell>
        <Skeleton variant="text" width={60} height={20} />
      </TableCell>

      {/* Addresses */}
      <TableCell>
        <Skeleton variant="text" width={30} height={20} />
      </TableCell>

      {/* Created */}
      <TableCell>
        <Skeleton variant="text" width={140} height={20} />
      </TableCell>

      {/* Actions */}
      <TableCell align="right">
        <Stack direction="row" justifyContent="flex-end" spacing={0.5}>
          <Skeleton variant="circular" width={28} height={28} />
          <Skeleton variant="circular" width={28} height={28} />
        </Stack>
      </TableCell>
    </TableRow>
  );
}

