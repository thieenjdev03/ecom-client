"use client";

import { createContext, useContext } from "react";

import { IProductItem } from "src/types/product";

// ----------------------------------------------------------------------

type WishlistContextType = {
  items: IProductItem[];
  onAddToWishlist: (product: IProductItem) => void;
  onRemoveFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  onClearWishlist: () => void;
};

export const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const useWishlistContext = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlistContext must be used within a WishlistProvider");
  }
  return context;
};
