import { NextRequest, NextResponse } from "next/server";
import { Product } from "src/types/product-dto";

// In-memory store for demo. Replace with real DB in production.
let PRODUCTS_STORE: Product[] = [];
let AUTO_ID = 1;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 10);

    const start = (page - 1) * limit;
    const end = start + limit;

    const data = PRODUCTS_STORE.slice(start, end);
    const total = PRODUCTS_STORE.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));

    return NextResponse.json({
      data: { data, meta: { total, page, limit, totalPages } },
      message: "Success",
      success: true,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch products", success: false },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const now = new Date().toISOString();
    const product: Product = {
      id: AUTO_ID++,
      name: body.name,
      slug: body.slug,
      description: body.description ?? null,
      short_description: body.short_description ?? null,
      price: String(body.price ?? "0"),
      sale_price: body.sale_price ? String(body.sale_price) : null,
      cost_price: body.cost_price ? String(body.cost_price) : null,
      images: body.images ?? [],
      variants: body.variants ?? [],
      stock_quantity: Number(body.stock_quantity ?? 0),
      sku: body.sku ?? null,
      barcode: body.barcode ?? null,
      category_id: body.category_id,
      category: body.category ?? {
        id: body.category_id,
        name: body.category_name || "",
        slug: body.category_slug || "",
        description: null,
        image_url: null,
        parent_id: null,
        display_order: 0,
        is_active: true,
        created_at: now,
        updated_at: now,
      },
      tags: body.tags ?? [],
      status: body.status ?? "active",
      is_featured: Boolean(body.is_featured),
      meta_title: body.meta_title ?? null,
      meta_description: body.meta_description ?? null,
      weight: body.weight ?? null,
      dimensions: body.dimensions ?? null,
      created_at: now,
      updated_at: now,
      deleted_at: null,
    };

    PRODUCTS_STORE.unshift(product);

    return NextResponse.json({ data: product, message: "Created", success: true });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to create product", success: false },
      { status: 400 },
    );
  }
}
