import { Product } from 'src/types/product-dto';

/**
 * Utility functions for mapping product data between API and form formats
 */

/**
 * Map API product data (snake_case) to form values (camelCase)
 * Handles both Product entity and raw API response formats
 * 
 * @param product - Product data from API
 * @param defaultValues - Default form values to merge with
 * @returns Form values object
 */
export function mapProductToFormValues(
  product: Product | undefined,
  defaultValues: any
): any {
  if (!product) return defaultValues;

  const hasVariants = Array.isArray(product.variants) && product.variants.length > 0;

  return {
    ...defaultValues,
    status: product.status || 'active',
    isFeatured: Boolean(product.is_featured),
    price: typeof product.price === 'string' ? Number(product.price) : product.price || 0,
    salePrice:
      product.sale_price != null
        ? typeof product.sale_price === 'string'
          ? Number(product.sale_price)
          : product.sale_price
        : undefined,
    name: product.name || '',
    slug: product.slug || '',
    description: product.description || '',
    shortDescription: product.short_description || '',
    categoryId: product.category_id?.toString() || '',
    quantity: 0,
    images: Array.isArray(product.images) ? product.images : [],
    colorIds: [],
    sizeIds: [],
    manageVariants: hasVariants,
    sku: hasVariants ? '' : product.sku || '',
    stockQuantity: hasVariants ? 0 : product.stock_quantity || 0,

    // Variants
    variants:
      hasVariants && product.variants
        ? product.variants.map((v: any) => ({
            name: v.name || '',
            sku: v.sku || '',
            price:
              typeof v.price === 'number'
                ? v.price
                : typeof v.price === 'string'
                ? Number(v.price)
                : 0,
            stock:
              typeof v.stock === 'number'
                ? v.stock
                : typeof v.stock === 'string'
                ? Number(v.stock)
                : 0,
            colorId: v.color_id || '',
            sizeId: v.size_id || '',
            imageUrl: v.image_url || v.imageUrl || '',
          }))
        : [],

    // Marketing fields
    isSale: Boolean(product.sale_price),
    saleLabel: '',
    isNew: false,
    newLabel: '',

    // Optional fields
    productCode: '',
    costPrice: product.cost_price ? Number(product.cost_price) : undefined,
    barcode: product.barcode || undefined,
    metaTitle: product.meta_title || undefined,
    metaDescription: product.meta_description || undefined,
    weight: product.weight ? Number(product.weight) : undefined,
    dimensions: product.dimensions
      ? {
          length: product.dimensions.length ? Number(product.dimensions.length) : undefined,
          width: product.dimensions.width ? Number(product.dimensions.width) : undefined,
          height: product.dimensions.height ? Number(product.dimensions.height) : undefined,
        }
      : {
          length: undefined,
          width: undefined,
          height: undefined,
        },
  };
}

/**
 * Map form values (camelCase) to API payload (snake_case)
 * Prepares data for creating or updating a product
 * 
 * @param data - Form values
 * @returns API payload object
 */
export function mapFormValuesToPayload(data: any): any {
  const basePrice = Number(data.price) || 0;
  const sale = data.salePrice != null ? Number(data.salePrice) : undefined;

  const payload: any = {
    name: data.name,
    slug: data.slug,
    description: data.description || undefined,
    short_description: data.shortDescription || undefined,
    images: (data.images as string[])?.slice(0, 5) || [],
    price: basePrice,
    sale_price: sale != null ? sale : undefined,
    cost_price: data.costPrice != null ? Number(data.costPrice) : undefined,
    barcode: data.barcode || undefined,
    status: data.status === 'active' ? 'active' : 'inactive',
    is_featured: !!data.isFeatured,
    meta_title: data.metaTitle || undefined,
    meta_description: data.metaDescription || undefined,
    weight: data.weight != null ? Number(data.weight) : undefined,
    dimensions:
      data.dimensions &&
      (data.dimensions.length != null ||
        data.dimensions.width != null ||
        data.dimensions.height != null)
        ? {
            length: data.dimensions.length != null ? Number(data.dimensions.length) : undefined,
            width: data.dimensions.width != null ? Number(data.dimensions.width) : undefined,
            height: data.dimensions.height != null ? Number(data.dimensions.height) : undefined,
          }
        : undefined,
    category_id: data.categoryId,
  };

  // Handle variants vs simple product
  if (data.manageVariants) {
    payload.variants = (data.variants || []).map((v: any) => ({
      name: v.name,
      sku: v.sku,
      price: Number(v.price) || 0,
      stock: Number(v.stock) || 0,
      color_id: v.colorId,
      size_id: v.sizeId,
      image_url: v.imageUrl || undefined,
    }));

    // Collect all variant image URLs and merge with product images (avoid duplicates)
    const variantImageUrls = (data.variants || [])
      .map((v: any) => v.imageUrl)
      .filter((url: string) => url && url.trim());
    const productImageUrls = (data.images as string[]) || [];
    const imageSet = new Set<string>([...productImageUrls, ...variantImageUrls]);
    const allImageUrls = Array.from(imageSet).slice(0, 5);

    // Update images array to include variant images
    payload.images = allImageUrls;

    // Ensure base-level SKU/stock are not set when variants exist
    if ((payload.variants as any[]).length > 0) {
      delete payload.sku;
      delete payload.stock_quantity;
    }
  } else {
    // Simple product: include base sku and stock quantity
    payload.sku = data.sku || undefined;
    payload.stock_quantity = Number(data.stockQuantity) || 0;
  }

  return payload;
}

/**
 * Validate sale price is not greater than regular price
 * 
 * @param price - Regular price
 * @param salePrice - Sale price
 * @returns true if valid, false otherwise
 */
export function validatePricing(price: number, salePrice?: number): boolean {
  if (salePrice == null) return true;
  return salePrice <= price;
}

