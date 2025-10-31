import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import Tooltip from "@mui/material/Tooltip";
import MenuItem from "@mui/material/MenuItem";
import TableRow from "@mui/material/TableRow";
import Checkbox from "@mui/material/Checkbox";
import TableCell from "@mui/material/TableCell";
import IconButton from "@mui/material/IconButton";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { useBoolean } from "src/hooks/use-boolean";

import Label from "src/components/label";
import Iconify from "src/components/iconify";
import { ConfirmDialog } from "src/components/custom-dialog";
import CustomPopover, { usePopover } from "src/components/custom-popover";

import { IUserItem } from "src/types/user";
import { fDateTime } from "src/utils/format-time";

import UserQuickEditForm from "./user-quick-edit-form";

// ----------------------------------------------------------------------

type Props = {
  selected: boolean;
  onEditRow: VoidFunction;
  row: IUserItem;
  onSelectRow: VoidFunction;
  onDeleteRow: VoidFunction;
};

export default function UserTableRow({
  row,
  selected,
  onEditRow,
  onSelectRow,
  onDeleteRow,
}: Props) {
  const {
    profile,
    name,
    avatarUrl,
    role,
    status,
    email,
    phoneNumber,
    addresses,
    createdAt,
    country,
    city,
    state,
    address,
    zipCode,
    company,
  } = row;

  const confirm = useBoolean();

  const quickEdit = useBoolean();

  const popover = usePopover();

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox checked={selected} onClick={onSelectRow} />
        </TableCell>

        <TableCell sx={{ display: "flex", alignItems: "center" }}>
          <Avatar alt={name} src={avatarUrl} sx={{ mr: 2 }} />
          <ListItemText
            primary={profile}
            primaryTypographyProps={{ typography: "body2" }}
            secondaryTypographyProps={{
              component: "span",
              color: "text.disabled",
            }}
          />
        </TableCell>

        <TableCell sx={{ whiteSpace: "nowrap" }}>{email}</TableCell>

        <TableCell sx={{ whiteSpace: "nowrap" }}>
          <Tooltip title={`${country || ""} ${city ? `- ${city}` : ""}`.trim()}>
            <span>{country || "-"}</span>
          </Tooltip>
        </TableCell>
        
        <TableCell sx={{ whiteSpace: "nowrap" }}>{phoneNumber}</TableCell>

        <TableCell sx={{ whiteSpace: "nowrap", textTransform: "capitalize" }}>{role}</TableCell>
        

        <TableCell sx={{ whiteSpace: "nowrap" }}>
          <Tooltip
            title={(() => {
              const def = addresses?.find((a) => a.isDefault);
              if (!def) {
                // Fallback to general address fields if available
                return address || city || state ? [address, city, state, zipCode].filter(Boolean).join(", ") : "";
              }
              const parts = [
                def.streetLine1,
                def.streetLine2,
                def.ward,
                def.district,
                def.province,
                def.postalCode,
              ]
                .filter(Boolean)
                .join(", ");
              return parts;
            })()}
          >
            <span>{addresses?.length ?? 0}</span>
          </Tooltip>
        </TableCell>

        <TableCell sx={{ whiteSpace: "nowrap" }}>
          {createdAt ? fDateTime(createdAt) : "-"}
        </TableCell>

        <TableCell>
          <Label
            variant="soft"
            color={
              (status === "active" && "success") ||
              (status === "pending" && "warning") ||
              (status === "banned" && "error") ||
              "default"
            }
          >
            {status}
          </Label>
        </TableCell>

        <TableCell align="right" sx={{ px: 1, whiteSpace: "nowrap" }}>
          <Tooltip title="Quick Edit" placement="top" arrow>
            <IconButton
              color={quickEdit.value ? "inherit" : "default"}
              onClick={quickEdit.onTrue}
            >
              <Iconify icon="solar:pen-bold" />
            </IconButton>
          </Tooltip>

          <IconButton
            color={popover.open ? "inherit" : "default"}
            onClick={popover.onOpen}
          >
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <UserQuickEditForm
        currentUser={row}
        open={quickEdit.value}
        onClose={quickEdit.onFalse}
      />

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 140 }}
      >
        <MenuItem
          onClick={() => {
            confirm.onTrue();
            popover.onClose();
          }}
          sx={{ color: "error.main" }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" />
          Delete
        </MenuItem>

        <MenuItem
          onClick={() => {
            onEditRow();
            popover.onClose();
          }}
        >
          <Iconify icon="solar:pen-bold" />
          Edit
        </MenuItem>
      </CustomPopover>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content="Are you sure want to delete?"
        action={
          <Button variant="contained" color="error" onClick={onDeleteRow}>
            Delete
          </Button>
        }
      />
    </>
  );
}
