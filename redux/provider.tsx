"use client";

import { Provider } from "react-redux";
import { store } from "./store";
import { useEffect } from "react";
import { initializeCart } from "./slices/cartSlice";
import { checkAuth } from "./slices/authSlice";

function InitializeStore({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize cart from localStorage
    store.dispatch(initializeCart());
    // Check authentication status
    store.dispatch(checkAuth());
  }, []);

  return <>{children}</>;
}

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <InitializeStore>{children}</InitializeStore>
    </Provider>
  );
}

