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
}: {
  priceBottom?: boolean;
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

  const carousel = useCarousel({
    dots: true,
    arrows: false,
    autoplay: false,
    slidesToShow: 3, // hiển thị 3 sp mỗi slide
    ...CarouselDots({
      sx: {
        position: 'static',
        mt: 3,
      },
    }),
  });

  return (
    <Container maxWidth={false} sx={{ py: { xs: 1, md: 2 }, width: '90%', maxWidth: '90%', mx: 'auto' }}>
      <Typography variant="h3" sx={{ mb: 5, textAlign: 'left', fontWeight: 700 }}>
        NO NAME'S NEW ARRIVAL
      </Typography>

      <Carousel ref={carousel.carouselRef} {...carousel.carouselSettings}>
        {products.map((p) => (
          <ProductCardMinimal key={p.id} product={p} priceBottom={priceBottom} />
        ))}
      </Carousel>
    </Container>
  );
}

type CardProps = {
  product: MinimalProduct;
  priceBottom?: boolean;
};

function ProductCardMinimal({ product, priceBottom }: CardProps) {
  return (
    <Box sx={{ px: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'stretch', flexDirection: priceBottom ? 'column-reverse' : 'row', p: priceBottom ? 8 : 0 }}>
        <Stack
          spacing={1}
          sx={{
            width: { xs: 140, md: 200 },
            minWidth: { xs: 140, md: 200 },
            pr: 2,
            py: 4,
            justifyContent: 'flex-end',
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

        <Box sx={{
          flex: 1,
        }}>
          <Image src={product.image} alt={product.name} ratio={priceBottom ? '1/1' : '3/4'} sx={{
            borderRadius: 0,
            objectPosition: priceBottom ? 'top' : 'center',
            objectFit: priceBottom ? 'cover' : 'contain',
          }} />
        </Box>
      </Box>
    </Box>
  );
}