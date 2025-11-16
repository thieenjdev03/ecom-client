import { IProductItem } from "src/types/product";
import { Product } from "src/types/product-dto";
import { t } from "src/utils/multi-lang";

export function adaptProductDtoToItem(dto: Product, locale: string = "en"): IProductItem {
  // Extract multi-language fields using locale with fallback
  const name = t(dto.name, locale);
  const description = t(dto.description, locale);
  const shortDescription = t(dto.short_description, locale);
  const categoryName = dto.category ? t(dto.category.name, locale) : "";

  return {
    id: String(dto.id),
    sku: dto.sku ?? "",
    name: name,
    code: dto.sku ?? String(dto.id),
    price: Number(dto.price),
    taxes: 0,
    tags: dto.tags ?? [],
    gender: "",
    sizes: [],
    variants: dto.variants as any,
    publish: dto.status === "active" ? "published" : "draft",
    coverUrl: dto.images?.[0] ?? "",
    images: dto.images ?? [],
    isFeatured: dto.is_featured ?? false,
    productPrice: Number(dto.price),
    is_new: false,
    is_sale: Boolean(dto.sale_price),
    colors: [],
    quantity: dto.stock_quantity ?? 0,
    category: categoryName,
    available: dto.stock_quantity ?? 0,
    totalSold: 0,
    description: description,
    totalRatings: 0,
    totalReviews: 0,
    inventoryType: (dto.stock_quantity ?? 0) > 0 ? "In Stock" : "Out of Stock",
    subDescription: shortDescription,
    dimensions: dto.dimensions ?? null,
    priceSale: dto.sale_price ? Number(dto.sale_price) : null,
    reviews: [],
    createdAt: dto.created_at ? new Date(dto.created_at) : new Date(),
    ratings: [],
    saleLabel: { 
      enabled: Boolean(dto.sale_price),
      content: dto.sale_price && dto.price && Number(dto.price) > 0
        ? `${Math.round(((Number(dto.price) - Number(dto.sale_price)) / Number(dto.price)) * 100)}%`
        : ""
    },
    newLabel: { enabled: false, content: "New" },
    modelHeight: 0,
    modelSize: 0,
  };
}
