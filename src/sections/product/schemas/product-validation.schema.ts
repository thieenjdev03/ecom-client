import * as Yup from 'yup';

/**
 * Product form validation schema
 * Contains all validation rules for creating/editing products
 */
export const createProductValidationSchema = (t: any) =>
  Yup.object().shape({
    status: Yup.string()
      .oneOf(['active', 'inactive']) // Align with API accepted values
      .required(t('productForm.statusRequired')),
    isFeatured: Yup.boolean(),
    price: Yup.number()
      .typeError(t('productForm.priceMustBeNumber'))
      .min(0)
      .required(t('productForm.priceRequired')),
    salePrice: Yup.number()
      .nullable()
      .typeError(t('productForm.priceMustBeNumber'))
      .min(0)
      .test('lte-price', t('productForm.salePriceCannotBeGreater'), function (value) {
        const { price } = this.parent as any;
        if (value == null) return true;
        return Number(value) <= Number(price || 0);
      }),
    // Multi-language fields
    name: Yup.object().shape({
      en: Yup.string().required(t('productForm.nameRequired')),
      vi: Yup.string().required(t('productForm.nameRequired')),
    }).required(),
    slug: Yup.object().shape({
      en: Yup.string().required(t('productForm.slugRequired')),
      vi: Yup.string().required(t('productForm.slugRequired')),
    }).required(),
    description: Yup.object().shape({
      en: Yup.string().nullable(),
      vi: Yup.string().nullable(),
    }).nullable(),
    shortDescription: Yup.object().shape({
      en: Yup.string().nullable(),
      vi: Yup.string().nullable(),
    }).nullable(),
    productCode: Yup.string().required(t('productForm.productCodeRequired')),
    category: Yup.string().required(t('productForm.categoryRequired')),
    quantity: Yup.number()
      .min(0)
      .when('manageVariants', {
        is: true,
        then: (schema) => schema.optional(),
        otherwise: (schema) => schema.required(t('productForm.quantityRequired')),
      }),
    saleLabel: Yup.string().nullable(),
    newLabel: Yup.string().nullable(),
    isSale: Yup.boolean(),
    colorIds: Yup.array()
      .of(Yup.string())
      .min(1, t('productForm.selectAtLeastOneColor'))
      .required(),
    sizeIds: Yup.array()
      .of(Yup.string())
      .min(1, t('productForm.selectAtLeastOneSize'))
      .required(),
    images: Yup.array()
      .of(Yup.string().url(t('productForm.mustBeValidUrl')))
      .max(5, t('productForm.maxFiveImages')),
    weight: Yup.number()
      .nullable()
      .typeError(t('productForm.weightMustBeNumber'))
      .min(0, t('productForm.weightMustBePositive')),
    dimensions: Yup.object()
      .shape({
        length: Yup.number()
          .nullable()
          .typeError(t('productForm.dimensionMustBeNumber'))
          .min(0, t('productForm.dimensionMustBePositive')),
        width: Yup.number()
          .nullable()
          .typeError(t('productForm.dimensionMustBeNumber'))
          .min(0, t('productForm.dimensionMustBePositive')),
        height: Yup.number()
          .nullable()
          .typeError(t('productForm.dimensionMustBeNumber'))
          .min(0, t('productForm.dimensionMustBePositive')),
      })
      .nullable(),
    manageVariants: Yup.boolean(),
    sku: Yup.string().when('manageVariants', {
      is: false,
      then: (schema) => schema.required(t('productForm.skuRequiredForSimple')),
      otherwise: (schema) => schema.optional(),
    }),
    stockQuantity: Yup.number()
      .typeError(t('productForm.priceMustBeNumber'))
      .when('manageVariants', {
        is: false,
        then: (schema) => schema.min(0).required(t('productForm.stockRequiredForSimple')),
        otherwise: (schema) => schema.optional(),
      }),
    variants: Yup.array()
      .of(
        Yup.object({
          name: Yup.object()
            .shape({
              en: Yup.string().nullable(),
              vi: Yup.string().nullable(),
            })
            .test('at-least-one-name', t('productForm.variantNameRequired'), function (value) {
              // Allow null/undefined during form initialization
              if (!value) return false;
              if (typeof value !== 'object' || Array.isArray(value)) return false;
              
              const en = value.en || '';
              const vi = value.vi || '';
              
              // At least one field must have a non-empty value
              const hasEn = typeof en === 'string' && en.trim().length > 0;
              const hasVi = typeof vi === 'string' && vi.trim().length > 0;
              
              return hasEn || hasVi;
            })
            .required(t('productForm.variantNameRequired')),
          sku: Yup.string().required(t('productForm.variantSkuRequired')),
          price: Yup.number()
            .typeError(t('productForm.priceMustBeNumber'))
            .min(0)
            .required(t('productForm.variantPriceRequired')),
          stock: Yup.number()
            .typeError(t('productForm.priceMustBeNumber'))
            .min(0)
            .required(t('productForm.variantStockRequired')),
          colorId: Yup.string().required(t('productForm.variantColorRequired')),
          sizeId: Yup.string().required(t('productForm.variantSizeRequired')),
          imageUrl: Yup.string().nullable().url(t('productForm.mustBeValidUrl')),
        })
      )
      .when('manageVariants', {
        is: true,
        then: (schema) =>
          schema
            .min(1, t('productForm.addAtLeastOneVariant'))
            .test('unique-sku', t('productForm.variantSkuMustBeUnique'), (list) => {
              if (!list) return true;
              const skus = list.map((v: any) => (v?.sku || '').trim()).filter(Boolean);
              return new Set(skus).size === skus.length;
            }),
        otherwise: (schema) => schema.optional(),
      }),
  });

/**
 * Default form values for product creation
 */
export const getDefaultProductFormValues = () => ({
  status: 'active',
  isFeatured: false,
  price: 0,
  salePrice: undefined as number | undefined,
  // Multi-language fields
  name: { en: '', vi: '' },
  slug: { en: '', vi: '' },
  description: { en: '', vi: '' },
  shortDescription: { en: '', vi: '' },
  productCode: '',
  sku: '',
  category: '',
  quantity: 0,
  saleLabel: '',
  newLabel: '',
  isSale: false,
  isNew: false,
  images: [] as string[],
  colorIds: [] as string[],
  sizeIds: [] as string[],
  weight: undefined as number | undefined,
  dimensions: {
    length: undefined as number | undefined,
    width: undefined as number | undefined,
    height: undefined as number | undefined,
  },
  manageVariants: false,
  stockQuantity: 0,
  barcode: undefined as string | undefined,
  enable_sale_tag: false,
  variants: [] as {
    name: { en: string; vi: string };
    sku: string;
    price: number;
    stock: number;
    colorId: string;
    sizeId: string;
    imageUrl?: string;
  }[],
});

