"use client";

import { useMemo, useCallback } from "react";

import { getStorage, useLocalStorage } from "src/hooks/use-local-storage";

import { IProductItem } from "src/types/product";

import { WishlistContext } from "./wishlist-context";

// ----------------------------------------------------------------------

const STORAGE_KEY = "wishlist";

const initialState = {
  items: [],
};

type Props = {
  children: React.ReactNode;
};

export function WishlistProvider({ children }: Props) {
  const { state, update, reset } = useLocalStorage(STORAGE_KEY, initialState);

  const onAddToWishlist = useCallback(
    (product: IProductItem) => {
      const isAlreadyInWishlist = state.items.some((item: IProductItem) => item.id === product.id);
      
      if (!isAlreadyInWishlist) {
        const updatedItems = [...state.items, product];
        update("items", updatedItems);
      }
    },
    [update, state.items],
  );

  const onRemoveFromWishlist = useCallback(
    (productId: string) => {
      const updatedItems = state.items.filter((item: IProductItem) => item.id !== productId);
      update("items", updatedItems);
    },
    [update, state.items],
  );

  const isInWishlist = useCallback(
    (productId: string) => {
      return state.items.some((item: IProductItem) => item.id === productId);
    },
    [state.items],
  );

  const onClearWishlist = useCallback(() => {
    update("items", []);
  }, [update]);

  const memoizedValue = useMemo(
    () => ({
      items: state.items,
      onAddToWishlist,
      onRemoveFromWishlist,
      isInWishlist,
      onClearWishlist,
    }),
    [state.items, onAddToWishlist, onRemoveFromWishlist, isInWishlist, onClearWishlist],
  );

  return (
    <WishlistContext.Provider value={memoizedValue}>
      {children}
    </WishlistContext.Provider>
  );
}
