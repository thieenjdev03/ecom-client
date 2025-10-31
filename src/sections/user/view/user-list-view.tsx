"use client";

import isEqual from "lodash/isEqual";
import { useState, useCallback, useEffect } from "react";

import Card from "@mui/material/Card";
import Table from "@mui/material/Table";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import Container from "@mui/material/Container";
import TableBody from "@mui/material/TableBody";
import IconButton from "@mui/material/IconButton";
import TableContainer from "@mui/material/TableContainer";

import { paths } from "src/routes/paths";
import { useRouter } from "src/routes/hooks";
import { RouterLink } from "src/routes/components";

import { useBoolean } from "src/hooks/use-boolean";

import { _roles } from "src/_mock";

import Iconify from "src/components/iconify";
import Scrollbar from "src/components/scrollbar";
import { useSnackbar } from "src/components/snackbar";
import { ConfirmDialog } from "src/components/custom-dialog";
import { useSettingsContext } from "src/components/settings";
import CustomBreadcrumbs from "src/components/custom-breadcrumbs";
import {
  useTable,
  emptyRows,
  TableNoData,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from "src/components/table";

import {
  IUserItem,
  IUserTableFilters,
  IUserTableFilterValue,
} from "src/types/user";

import { usersApi } from "src/api/user";

import UserTableRow from "../user-table-row";
import UserTableToolbar from "../user-table-toolbar";
import UserTableFiltersResult from "../user-table-filters-result";

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: "name", label: "Name", width: 300 },
  { id: "email", label: "Email", width: 240 },
  { id: "country", label: "Country", width: 240 },
  { id: "phoneNumber", label: "Phone Number", width: 160 },
  { id: "role", label: "Role", width: 120 },
  { id: "addresses", label: "Addresses", width: 140 },
  { id: "createdAt", label: "Created", width: 180 },
  { id: "status", label: "Status", width: 100 },
  { id: "", width: 88 },
];

const defaultFilters: IUserTableFilters = {
  name: "",
  role: [],
  status: "all",
};

// ----------------------------------------------------------------------

export default function UserListView() {
  const { enqueueSnackbar } = useSnackbar();

  const table = useTable();

  const settings = useSettingsContext();

  const router = useRouter();

  const confirm = useBoolean();

  const [tableData, setTableData] = useState<IUserItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  const [filters, setFilters] = useState(defaultFilters);

  const denseHeight = table.dense ? 56 : 56 + 20;

  const canReset = !isEqual(defaultFilters, filters);

  const notFound = (!tableData.length && canReset) || !tableData.length;

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, any> = {
        page: table.page + 1,
        limit: table.rowsPerPage,
        // sortBy: table.orderBy,
        // sortOrder: table.order.toUpperCase(),
      };
      if (filters.name) {
        // Map UI "name" search to API email filter per documentation
        params.email = filters.name;
      }
      if (filters.role && filters.role.length) {
        // Backend expects a single role; if multi-selected, send first
        params.role = filters.role[0];
      }
      const res = await usersApi.list(params);
      const payload = res.data ? res.data : res;
      const list = payload.data || [];
      setTableData(list as IUserItem[]);
      setTotal(payload.total || list.length || 0);
    } catch (err: any) {
      enqueueSnackbar(err?.message || "Failed to load users", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [
    enqueueSnackbar,
    filters.name,
    filters.role,
    table.page,
    table.rowsPerPage,
  ]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleFilters = useCallback(
    (name: string, value: IUserTableFilterValue) => {
      table.onResetPage();
      setFilters((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    },
    [table],
  );

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const handleDeleteRow = useCallback(
    async (id: string) => {
      try {
        await usersApi.remove(id);
        enqueueSnackbar("Delete success!");
        fetchUsers();
      } catch (err: any) {
        enqueueSnackbar(err?.message || "Delete failed", { variant: "error" });
      }
    },
    [enqueueSnackbar, fetchUsers, table],
  );

  const handleDeleteRows = useCallback(async () => {
    try {
      await Promise.all(table.selected.map((id) => usersApi.remove(id)));
      enqueueSnackbar("Delete success!");
      fetchUsers();
    } catch (err: any) {
      enqueueSnackbar(err?.message || "Delete failed", { variant: "error" });
    }
  }, [enqueueSnackbar, fetchUsers, table]);

  const handleEditRow = useCallback(
    (id: string) => {
      router.push(paths.dashboard.user.edit(id));
    },
    [router],
  );

  // removed status tabs; status filter is handled via toolbar and API mapping (if needed)

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : "lg"}>
        <CustomBreadcrumbs
          heading="List"
          links={[
            { name: "Dashboard", href: paths.dashboard.root },
            { name: "User", href: paths.dashboard.user.root },
            { name: "List" },
          ]}
          action={
            <Button
              component={RouterLink}
              href={paths.dashboard.user.new}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              New User
            </Button>
          }
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />

        <Card>
          <UserTableToolbar
            filters={filters}
            onFilters={handleFilters}
            //
            roleOptions={_roles}
          />

          {canReset && (
            <UserTableFiltersResult
              filters={filters}
              onFilters={handleFilters}
              //
              onResetFilters={handleResetFilters}
              //
              results={tableData.length}
              sx={{ p: 2.5, pt: 0 }}
            />
          )}

          <TableContainer sx={{ position: "relative", overflow: "unset" }}>
            <TableSelectedAction
              dense={table.dense}
              numSelected={table.selected.length}
              rowCount={total}
              onSelectAllRows={(checked) =>
                table.onSelectAllRows(
                  checked,
                  tableData.map((row) => row.id),
                )
              }
              action={
                <Tooltip title="Delete">
                  <IconButton color="primary" onClick={confirm.onTrue}>
                    <Iconify icon="solar:trash-bin-trash-bold" />
                  </IconButton>
                </Tooltip>
              }
            />

            <Scrollbar>
              <Table
                size={table.dense ? "small" : "medium"}
                sx={{ minWidth: 960 }}
              >
                <TableHeadCustom
                  order={table.order}
                  orderBy={table.orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={total}
                  numSelected={table.selected.length}
                  onSort={table.onSort}
                  onSelectAllRows={(checked) =>
                    table.onSelectAllRows(
                      checked,
                      tableData.map((row) => row.id),
                    )
                  }
                />

                <TableBody>
                  {tableData
                    .slice(
                      table.page * table.rowsPerPage,
                      table.page * table.rowsPerPage + table.rowsPerPage,
                    )
                    .map((row) => (
                      <UserTableRow
                        key={row.id}
                        row={row}
                        selected={table.selected.includes(row.id)}
                        onSelectRow={() => table.onSelectRow(row.id)}
                        onDeleteRow={() => handleDeleteRow(row.id)}
                        onEditRow={() => handleEditRow(row.id)}
                      />
                    ))}

                  <TableEmptyRows
                    height={denseHeight}
                    emptyRows={emptyRows(
                      table.page,
                      table.rowsPerPage,
                      tableData.length,
                    )}
                  />

                  <TableNoData notFound={notFound} />
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>

          <TablePaginationCustom
            count={total}
            page={table.page}
            rowsPerPage={table.rowsPerPage}
            onPageChange={table.onChangePage}
            onRowsPerPageChange={table.onChangeRowsPerPage}
            //
            dense={table.dense}
            onChangeDense={table.onChangeDense}
          />
        </Card>
      </Container>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content={
          <>
            Are you sure want to delete{" "}
            <strong> {table.selected.length} </strong> items?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleDeleteRows();
              confirm.onFalse();
            }}
          >
            Delete
          </Button>
        }
      />
    </>
  );
}

// ----------------------------------------------------------------------

function applyFilter({
  inputData,
  comparator,
  filters,
}: {
  inputData: IUserItem[];
  comparator: (a: any, b: any) => number;
  filters: IUserTableFilters;
}) {
  const { name, status, role } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index] as const);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (name) {
    inputData = inputData.filter(
      (user) => user.name.toLowerCase().indexOf(name.toLowerCase()) !== -1,
    );
  }

  if (status !== "all") {
    inputData = inputData.filter((user) => user.status === status);
  }

  if (role.length) {
    inputData = inputData.filter((user) => role.includes(user.role));
  }

  return inputData;
}
