import { NextRequest, NextResponse } from "next/server";
import { Product } from "src/types/product-dto";

// Reuse the in-memory store by importing via the index if needed.
// Since module scoping differs per file, we maintain a minimal singleton via globalThis.
const globalAny = globalThis as unknown as {
  PRODUCTS_STORE?: Product[];
};
if (!globalAny.PRODUCTS_STORE) globalAny.PRODUCTS_STORE = [];

function getStore() {
  return globalAny.PRODUCTS_STORE as Product[];
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const id = Number(params.id);
  const found = getStore().find((p) => p.id === id);
  if (!found) {
    return NextResponse.json(
      { message: "Not found", success: false },
      { status: 404 },
    );
  }
  return NextResponse.json({ data: found, message: "Success", success: true });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const id = Number(params.id);
    const body = await req.json();
    const store = getStore();
    const index = store.findIndex((p) => p.id === id);
    if (index === -1) {
      return NextResponse.json(
        { message: "Not found", success: false },
        { status: 404 },
      );
    }
    const prev = store[index];
    const updated: Product = {
      ...prev,
      ...body,
      price: body.price !== undefined ? String(body.price) : prev.price,
      sale_price:
        body.sale_price !== undefined ? String(body.sale_price) : prev.sale_price,
      stock_quantity:
        body.stock_quantity !== undefined
          ? Number(body.stock_quantity)
          : prev.stock_quantity,
      updated_at: new Date().toISOString(),
    };
    store[index] = updated;
    return NextResponse.json({ data: updated, message: "Updated", success: true });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to update", success: false },
      { status: 400 },
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const id = Number(params.id);
  const store = getStore();
  const index = store.findIndex((p) => p.id === id);
  if (index === -1) {
    return NextResponse.json(
      { message: "Not found", success: false },
      { status: 404 },
    );
  }
  const removed = store.splice(index, 1)[0];
  return NextResponse.json({ data: removed, message: "Deleted", success: true });
}


