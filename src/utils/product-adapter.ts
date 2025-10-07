import { IProductItem } from 'src/types/product';
import { ProductDto, ProductVariantDto, ColorDto, SizeDto } from 'src/types/product-dto';

export function adaptProductDtoToItem(dto: ProductDto): IProductItem {
  return {
    id: dto.id,
    sku: dto.productSku ?? '',
    name: dto.productCode,
    code: dto.productCode,
    price: dto.variants?.[0]?.price ?? 0,
    taxes: 0,
    tags: dto.tags ?? [],
    gender: (dto.gender ?? []).join(','),
    sizes: (dto.sizes ?? []).map((s) => s.name),
    publish: 'published',
    coverUrl: dto.variants?.[0]?.imageUrl ?? '',
    images: dto.variants?.map((v) => v.imageUrl || '').filter(Boolean) ?? [],
    colors: (dto.colors ?? []).map((c) => c.name),
    quantity: dto.quantity ?? 0,
    category: dto.category?.name ?? '',
    available: dto.variants?.reduce((sum, v) => sum + (v.isAvailable ? 1 : 0), 0) ?? 0,
    totalSold: 0,
    description: '',
    totalRatings: 0,
    totalReviews: 0,
    inventoryType: dto.isNew ? 'new' : dto.isSale ? 'sale' : 'in_stock',
    subDescription: '',
    priceSale: dto.variants?.[0]?.salePrice ?? null,
    reviews: [],
    createdAt: new Date(),
    ratings: [],
    saleLabel: { enabled: !!dto.isSale, content: dto.saleLabel ?? '' },
    newLabel: { enabled: !!dto.isNew, content: dto.newLabel ?? '' },
  };
}


