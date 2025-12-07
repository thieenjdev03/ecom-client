import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import Tooltip from "@mui/material/Tooltip";
import MenuItem from "@mui/material/MenuItem";
import TableRow from "@mui/material/TableRow";
import Checkbox from "@mui/material/Checkbox";
import TableCell from "@mui/material/TableCell";
import IconButton from "@mui/material/IconButton";
import ListItemText from "@mui/material/ListItemText";

import { useBoolean } from "src/hooks/use-boolean";

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
    firstName,
    lastName,
    role,
    email,
    phoneNumber,
    addresses,
    createdAt,
    country,
  } = row;

  // Combine firstName and lastName for display
  const fullName = `${firstName || ""} ${lastName || ""}`.trim() || "-";

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
          <Avatar alt={fullName} src={profile || ""} sx={{ mr: 2 }} />
          <ListItemText
            primary={fullName}
            secondary={email}
            primaryTypographyProps={{ typography: "body2", fontWeight: 600 }}
            secondaryTypographyProps={{
              component: "span",
              color: "text.disabled",
              typography: "caption",
            }}
          />
        </TableCell>

        <TableCell sx={{ whiteSpace: "nowrap" }}>{email}</TableCell>

        <TableCell sx={{ whiteSpace: "nowrap" }}>{country || "-"}</TableCell>
        
        <TableCell sx={{ whiteSpace: "nowrap" }}>{phoneNumber}</TableCell>

        <TableCell sx={{ whiteSpace: "nowrap", textTransform: "capitalize" }}>{role}</TableCell>
        

        <TableCell sx={{ whiteSpace: "nowrap" }}>
          <Tooltip
            title={(() => {
              const def = addresses?.find((a) => a.isDefault);
              if (!def && addresses?.length) {
                // Use first address if no default
                const first = addresses[0];
                return [first.streetLine1, first.district, first.province].filter(Boolean).join(", ");
              }
              if (!def) return "No addresses";
              const parts = [
                def.streetLine1,
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

        {/* <TableCell>
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
        </TableCell> */}

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
