export type ProductDto = {
  id: string;
  productCode: string;
  productSku: string | null;
  category: { id: string; name?: string };
  quantity: number;
  tags: string[];
  images: string[];
  isFeatured: boolean;
  productPrice: number;
  is_new: boolean;
  is_sale: boolean;
  gender: string[];
  saleLabel: string | null;
  newLabel: string | null;
  isSale: boolean;
  isNew: boolean;
  variants: ProductVariantDto[];
  colors: ColorDto[];
  sizes: SizeDto[];
};

export type ProductVariantDto = {
  id: string;
  color: ColorDto;
  size: SizeDto;
  sku: string;
  price: number;
  salePrice: number | null;
  quantity: number;
  imageUrl: string | null;
  isAvailable: boolean;
};

export type ColorDto = {
  id: string;
  name: string;
  hexCode: string | null;
};

export type SizeDto = {
  id: string;
  name: string;
  category: { id: string } | null;
  sortOrder: number;
};
