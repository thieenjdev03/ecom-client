import { useMemo } from 'react';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { useTheme } from '@mui/material/styles';

import Iconify from 'src/components/iconify';
import Image from 'src/components/image';
import Carousel, { useCarousel, CarouselDots } from 'src/components/carousel';
import { fCurrency } from 'src/utils/format-number';

type MinimalProduct = {
  id: string;
  name: string;
  price: number;
  priceSale?: number | null;
  image: string;
};

export default function HomeProductShowcase({
  priceBottom,
  layout,
}: {
  priceBottom?: boolean;
  layout?: 'image-left' | 'price-bottom';
}) {
  const theme = useTheme();

  const products: MinimalProduct[] = useMemo(
    () => [
      {
        id: 'p1',
        name: 'Goxx 02',
        price: 580,
        priceSale: null,
        image: '/assets/images/home/products/product-1.avif',
      },
      {
        id: 'p2',
        name: 'Hypnosis A02',
        price: 500,
        priceSale: 560,
        image: '/assets/images/home/products/product-2.avif',
      },
      {
        id: 'p3',
        name: 'Paranoyd 02',
        price: 450,
        priceSale: null,
        image: '/assets/images/home/products/product-3.avif',
      },
      {
        id: 'p4',
        name: 'Species MSV2',
        price: 555,
        priceSale: 590,
        image: '/assets/images/home/products/product-1.avif',
      },
      { id: 'p5', name: 'Lumé A1', price: 399, priceSale: null, image: '/assets/images/home/products/product-1.avif' },
      { id: 'p6', name: 'Lumé A2', price: 420, priceSale: 460, image: '/assets/images/home/products/product-2.avif' },
      { id: 'p7', name: 'Lumé A3', price: 480, priceSale: null, image: '/assets/images/home/products/product-3.avif' },
      { id: 'p8', name: 'Lumé A4', price: 520, priceSale: 560, image: '/assets/images/home/products/product-1.avif' },
      { id: 'p9', name: 'Lumé A5', price: 610, priceSale: null, image: '/assets/images/home/products/product-2.avif' },
      { id: 'p10', name: 'Lumé A6', price: 650, priceSale: 690, image: '/assets/images/home/products/product-3.avif' },
    ],
    []
  );

  const thumbnails = products.map((p) => p.image);

  const carousel = useCarousel({
    dots: true,
    arrows: false,
    autoplay: false,
    slidesToShow: (layout ?? (priceBottom ? 'price-bottom' : 'image-left')) === 'price-bottom' ? 4 : 2,
    appendDots: (dots: React.ReactNode) => (
      <Box
        component="div"
        sx={{
          display: 'flex',
          justifyContent: 'center',
          position: 'static',
          '& ul': {
            m: 4,
            p: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            listStyle: 'none',
          },
          '& li': {
            width: { xs: 42, md: 42 },
            height: { xs: 42, md: 56 },
            aspectRatio: '3/4',
            opacity: 0.6,
            cursor: 'pointer',
            transition: (theme) => theme.transitions.create(['opacity', 'transform'], {
              duration: 200,
            }),
            '&.slick-active': {
              opacity: 1,
              transform: 'scale(1.03)',
            },
          },
        }}
      >
        {dots}
      </Box>
    ),
    customPaging: (index: number) => (
      <Box
        component="div"
        sx={{
          width: 1,
          height: 1,
          borderRadius: 1,
          overflow: 'hidden',
          bgcolor: 'background.neutral',
        }}
      >
        <Image
          src={thumbnails[index]}
          alt={`preview-${index + 1}`}
          ratio="1/1"
          imgSx={{ objectFit: 'cover' }}
        />
      </Box>
    ),
  });

  const effectiveLayout: 'image-left' | 'price-bottom' = layout ?? (priceBottom ? 'price-bottom' : 'image-left');

  return (
    <Container
      maxWidth={false}
      sx={{ px: { xs: 6, md: 8 }, py: { xs: 6, md: 8 }, mx: 'auto', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}
    >
      <Typography variant="h3" sx={{ mb: 3, textAlign: 'left', fontWeight: 700, flex: '0 0 auto' }}>
        NO NAME'S NEW ARRIVAL
      </Typography>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          '--thumb-h': { xs: '56px', md: '72px' },
          '& .slick-list': { height: 'calc(100% - var(--thumb-h))' },
          '& .slick-track': { height: '100%' },
          '& .slick-slide > div': { height: '100%' },
          '& .slick-dots': { position: 'static', mb: 0, mt: 2 },
        }}
      >
        <Carousel ref={carousel.carouselRef} {...carousel.carouselSettings}>
          {products.map((p) => (
            <ProductCard key={p.id} product={p} layout={effectiveLayout} />
          ))}
        </Carousel>
      </Box>
    </Container>
  );
}

type ProductCardLayout = 'image-left' | 'price-bottom';

type CardProps = {
  product: MinimalProduct;
  layout?: ProductCardLayout;
};

function ProductCard({ product, layout = 'image-left' }: CardProps) {
  const isPriceBottom = layout === 'price-bottom';

  return (
    <Box sx={{ px: 1, height: '100%' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'stretch',
          flexDirection: isPriceBottom ? 'column-reverse' : 'row',
          p: isPriceBottom ? 2 : 0,
          height: '100%',
        }}
      >
        <Stack
          spacing={1}
          sx={{
            width: { xs: 140, md: 200 },
            minWidth: { xs: 140, md: 200 },
            pr: isPriceBottom ? 0 : 2,
            pt: isPriceBottom ? 2 : 1,
            pb: 1,
            justifyContent: 'flex-end',
            flexShrink: 0,
          }}
        >
          <Typography variant="subtitle1">{product.name}</Typography>
          <Stack direction="row" spacing={1}>
            {product.priceSale && (
              <Typography variant="body2" sx={{ color: 'text.disabled', textDecoration: 'line-through' }}>
                {fCurrency(product.priceSale)}
              </Typography>
            )}
            <Typography variant="subtitle2">{fCurrency(product.price)}</Typography>
          </Stack>
          <Link
            color="inherit"
            underline="always"
            sx={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 0.5 }}
          >
            <Iconify icon="solar:heart-linear" width={18} /> Add to wishlist
          </Link>
        </Stack>

        <Box sx={{ flex: 1, minHeight: 0 }}>
          <Image
            src={product.image}
            alt={product.name}
            ratio={isPriceBottom ? '1/1' : undefined}
            loading="lazy"
            height={'100%'}
            sx={{ borderRadius: 0 }}
            imgSx={{
              objectPosition: isPriceBottom ? 'top' : 'center',
              objectFit: isPriceBottom ? 'cover' : 'contain',
            }}
          />
        </Box>
      </Box>
    </Box>
  );
}