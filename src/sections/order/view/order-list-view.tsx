"use client";

import { useState, useCallback, useMemo } from "react";

import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Card from "@mui/material/Card";
import Table from "@mui/material/Table";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import { alpha } from "@mui/material/styles";
import Container from "@mui/material/Container";
import TableBody from "@mui/material/TableBody";
import IconButton from "@mui/material/IconButton";
import TableContainer from "@mui/material/TableContainer";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { paths } from "src/routes/paths";
import { useRouter } from "src/routes/hooks";

import { useBoolean } from "src/hooks/use-boolean";

import { isAfter, isBetween } from "src/utils/format-time";

import { ORDER_STATUS_OPTIONS } from "src/_mock";

import Label from "src/components/label";
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
  getComparator,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from "src/components/table";

import {
  IOrderItem,
  IOrderTableFilters,
  IOrderTableFilterValue,
  IOrderCustomer,
  IOrderProductItem,
} from "src/types/order";

import { useGetOrders, orderApi } from "src/api/order";
import { Order } from "src/api/order";

import OrderTableRow from "../order-table-row";
import OrderTableToolbar from "../order-table-toolbar";
import OrderTableFiltersResult from "../order-table-filters-result";

// ----------------------------------------------------------------------

const STATUS_OPTIONS = [
  { value: "all", label: "All" },
  ...ORDER_STATUS_OPTIONS,
];

const TABLE_HEAD = [
  { id: "orderNumber", label: "Order No.", width: 140 },
  { id: "createdAt", label: "Created At", width: 160 },
  { id: "updatedAt", label: "Updated At", width: 160 },
  { id: "customer", label: "Customer", width: 200 },
  { id: "totalAmount", label: "Total", width: 120, align: "right" },
  { id: "paymentMethod", label: "Payment", width: 150 },
  { id: "status", label: "Status", width: 120 },
  { id: "products", label: "Products", width: 200 },
  { id: "shipping", label: "Shipping", width: 150 },
  { id: "notes", label: "Notes", width: 80, align: "center" },
  { id: "", width: 88 },
];

const defaultFilters: IOrderTableFilters = {
  name: "",
  status: "all",
  startDate: null,
  endDate: null,
  paymentMethod: [],
  country: "",
};

// ----------------------------------------------------------------------

// Transform API Order to UI IOrderItem
function transformOrderToIOrderItem(order: Order): IOrderItem {
  const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const subTotal = parseFloat(order.summary.total);
  const shipping = parseFloat(order.summary.shipping);
  const tax = parseFloat(order.summary.tax || "0");
  const discount = parseFloat(order.summary.discount);
  
  // Transform customer - handle firstName/lastName if available
  const customer: IOrderCustomer = order.user ? {
    id: order.user.id,
    name: order.user.name || `${(order as any).user?.firstName || ''} ${(order as any).user?.lastName || ''}`.trim() || "Unknown",
    email: order.user.email,
    avatarUrl: order.user.avatarUrl || "",
    ipAddress: "",
    country: (order as any).user?.country || "",
    firstName: (order as any).user?.firstName,
    lastName: (order as any).user?.lastName,
  } : {
    id: order.userId,
    name: "Unknown Customer",
    email: "unknown@example.com",
    avatarUrl: "",
    ipAddress: "",
  };

  // Transform items
  const productItems: IOrderProductItem[] = order.items.map((item, index) => ({
    id: item.variantId || item.productId.toString() || index.toString(),
    sku: item.sku || `${item.productId}-${item.variantId || 'default'}`,
    name: item.productName,
    price: parseFloat(item.unitPrice),
    coverUrl: "", // API doesn't provide this, may need to fetch from product
    quantity: item.quantity,
    variantName: item.variantName,
    productSlug: item.productSlug,
    productId: item.productId,
    variantId: item.variantId,
  }));

  return {
    id: order.id,
    taxes: tax,
    status: order.status.toLowerCase(),
    shipping: shipping,
    discount: discount,
    subTotal: subTotal - discount,
    orderNumber: order.orderNumber,
    totalAmount: subTotal,
    totalQuantity: totalQuantity,
    history: {
      orderTime: new Date(order.createdAt),
      paymentTime: order.paidAt ? new Date(order.paidAt) : new Date(order.createdAt),
      deliveryTime: new Date(order.createdAt),
      completionTime: new Date(order.updatedAt),
      timeline: [
        {
          title: "Order placed",
          time: new Date(order.createdAt),
        },
        ...(order.paidAt ? [{
          title: "Payment completed",
          time: new Date(order.paidAt),
        }] : []),
        {
          title: "Order updated",
          time: new Date(order.updatedAt),
        },
      ],
    },
    customer: customer,
    delivery: {
      shipBy: (order as any).carrier || "",
      speedy: "",
      trackingNumber: (order as any).trackingNumber || "",
    },
    items: productItems,
    createdAt: new Date(order.createdAt),
    updatedAt: new Date(order.updatedAt),
    // New fields
    paymentMethod: order.paymentMethod,
    paidAt: order.paidAt ? new Date(order.paidAt) : null,
    currency: order.summary.currency || "USD",
    carrier: (order as any).carrier || null,
    trackingNumber: (order as any).trackingNumber || null,
    notes: order.notes || null,
    internalNotes: (order as any).internalNotes || null,
    shippingAddress: order.shippingAddress || null,
    billingAddress: order.billingAddress || null,
  };
}

export default function OrderListView() {
  const { enqueueSnackbar } = useSnackbar();

  const table = useTable({ defaultOrderBy: "updatedAt", defaultOrder: "desc" });

  const settings = useSettingsContext();

  const router = useRouter();

  const confirm = useBoolean();

  const [filters, setFilters] = useState(defaultFilters);

  // Fetch orders from API
  const { orders, ordersLoading, ordersError, mutateOrders } = useGetOrders({
    status: filters.status !== "all" ? filters.status : undefined,
  });

  const dateError = isAfter(filters.startDate, filters.endDate);

  // Transform API orders to UI format
  const tableData = useMemo(() => {
    return orders.map(transformOrderToIOrderItem);
  }, [orders]);

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters,
    dateError,
  });

  const dataInPage = dataFiltered.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage,
  );

  const denseHeight = table.dense ? 56 : 56 + 20;

  const canReset =
    !!filters.name ||
    filters.status !== "all" ||
    (!!filters.startDate && !!filters.endDate) ||
    (filters.paymentMethod && filters.paymentMethod.length > 0) ||
    !!filters.country;

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  const handleFilters = useCallback(
    (name: string, value: IOrderTableFilterValue) => {
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
        await orderApi.delete(id);
        enqueueSnackbar("Delete success!");
        mutateOrders(); // Refresh data
        table.onUpdatePageDeleteRow(dataInPage.length);
      } catch (error) {
        console.error("Error deleting order:", error);
        enqueueSnackbar("Failed to delete order", { variant: "error" });
      }
    },
    [dataInPage.length, enqueueSnackbar, table, mutateOrders],
  );

  const handleDeleteRows = useCallback(async () => {
    try {
      await Promise.all(
        table.selected.map((id) => orderApi.delete(id))
      );
      enqueueSnackbar("Delete success!");
      mutateOrders(); // Refresh data
      table.onUpdatePageDeleteRows({
        totalRowsInPage: dataInPage.length,
        totalRowsFiltered: dataFiltered.length,
      });
    } catch (error) {
      console.error("Error deleting orders:", error);
      enqueueSnackbar("Failed to delete orders", { variant: "error" });
    }
  }, [
    dataFiltered.length,
    dataInPage.length,
    enqueueSnackbar,
    table,
    mutateOrders,
  ]);

  const handleViewRow = useCallback(
    (id: string) => {
      router.push(paths.dashboard.order.details(id));
    },
    [router],
  );

  const handleFilterStatus = useCallback(
    (event: React.SyntheticEvent, newValue: string) => {
      handleFilters("status", newValue);
    },
    [handleFilters],
  );

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : "lg"}>
        <CustomBreadcrumbs
          heading="List"
          links={[
            {
              name: "Dashboard",
              href: paths.dashboard.root,
            },
            {
              name: "Order",
              href: paths.dashboard.order.root,
            },
            { name: "List" },
          ]}
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />

        <Card>
          <Tabs
            value={filters.status}
            onChange={handleFilterStatus}
            sx={{
              px: 2.5,
              boxShadow: (theme) =>
                `inset 0 -2px 0 0 ${alpha(theme.palette.grey[500], 0.08)}`,
            }}
          >
            {STATUS_OPTIONS.map((tab) => (
              <Tab
                key={tab.value}
                iconPosition="end"
                value={tab.value}
                label={tab.label}
                icon={
                  <Label
                    variant={
                      ((tab.value === "all" || tab.value === filters.status) &&
                        "filled") ||
                      "soft"
                    }
                    color={
                      (tab.value === "completed" && "success") ||
                      (tab.value === "pending" && "warning") ||
                      (tab.value === "cancelled" && "error") ||
                      "default"
                    }
                  >
                    {["completed", "pending", "cancelled", "refunded"].includes(
                      tab.value,
                    )
                      ? tableData.filter((order) => order.status === tab.value)
                          .length
                      : tableData.length}
                  </Label>
                }
              />
            ))}
          </Tabs>

          <OrderTableToolbar
            filters={filters}
            onFilters={handleFilters}
            //
            dateError={dateError}
          />

          {canReset && (
            <OrderTableFiltersResult
              filters={filters}
              onFilters={handleFilters}
              //
              onResetFilters={handleResetFilters}
              //
              results={dataFiltered.length}
              sx={{ p: 2.5, pt: 0 }}
            />
          )}

          <TableContainer sx={{ position: "relative", overflow: "unset" }}>
            {ordersLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                <CircularProgress />
              </Box>
            ) : ordersError ? (
              <Box sx={{ p: 3, textAlign: "center" }}>
                <Typography variant="body2" color="error">
                  Failed to load orders. Please try again.
                </Typography>
              </Box>
            ) : (
              <>
                <TableSelectedAction
                  dense={table.dense}
                  numSelected={table.selected.length}
                  rowCount={dataFiltered.length}
                  onSelectAllRows={(checked) =>
                    table.onSelectAllRows(
                      checked,
                      dataFiltered.map((row) => row.id),
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
                      rowCount={dataFiltered.length}
                      numSelected={table.selected.length}
                      onSort={table.onSort}
                      onSelectAllRows={(checked) =>
                        table.onSelectAllRows(
                          checked,
                          dataFiltered.map((row) => row.id),
                        )
                      }
                    />

                    <TableBody>
                      {dataFiltered
                        .slice(
                          table.page * table.rowsPerPage,
                          table.page * table.rowsPerPage + table.rowsPerPage,
                        )
                        .map((row) => (
                          <OrderTableRow
                            key={row.id}
                            row={row}
                            selected={table.selected.includes(row.id)}
                            onSelectRow={() => table.onSelectRow(row.id)}
                            onDeleteRow={() => handleDeleteRow(row.id)}
                            onViewRow={() => handleViewRow(row.id)}
                          />
                        ))}

                      <TableEmptyRows
                        height={denseHeight}
                        emptyRows={emptyRows(
                          table.page,
                          table.rowsPerPage,
                          dataFiltered.length,
                        )}
                      />

                      <TableNoData notFound={notFound} />
                    </TableBody>
                  </Table>
                </Scrollbar>
              </>
            )}
          </TableContainer>

          <TablePaginationCustom
            count={dataFiltered.length}
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
  dateError,
}: {
  inputData: IOrderItem[];
  comparator: (a: any, b: any) => number;
  filters: IOrderTableFilters;
  dateError: boolean;
}) {
  const { status, name, startDate, endDate, paymentMethod, country } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index] as const);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  // Search filter - search in orderNumber, email, trackingNumber, productName
  if (name) {
    inputData = inputData.filter((order) => {
      const searchLower = name.toLowerCase();
      const orderNumberMatch = order.orderNumber.toLowerCase().indexOf(searchLower) !== -1;
      const emailMatch = order.customer.email.toLowerCase().indexOf(searchLower) !== -1;
      const trackingMatch = order.trackingNumber?.toLowerCase().indexOf(searchLower) !== -1;
      const productMatch = order.items.some((item) =>
        item.name.toLowerCase().indexOf(searchLower) !== -1
      );
      const customerNameMatch = order.customer.name.toLowerCase().indexOf(searchLower) !== -1;
      
      return orderNumberMatch || emailMatch || trackingMatch || productMatch || customerNameMatch;
    });
  }

  // Status filter
  if (status !== "all") {
    inputData = inputData.filter((order) => order.status === status);
  }

  // Payment method filter (multi-select)
  if (paymentMethod && paymentMethod.length > 0) {
    inputData = inputData.filter((order) =>
      order.paymentMethod && paymentMethod.includes(order.paymentMethod.toUpperCase())
    );
  }

  // Country filter
  if (country) {
    inputData = inputData.filter((order) =>
      order.customer.country?.toLowerCase() === country.toLowerCase()
    );
  }

  // Date range filter
  if (!dateError) {
    if (startDate && endDate) {
      inputData = inputData.filter((order) =>
        isBetween(order.createdAt, startDate, endDate),
      );
    }
  }

  return inputData;
}
