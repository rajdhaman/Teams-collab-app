import React from "react";

export {};

declare global {
  namespace React {
    interface CSSProperties {
      [key: `--${string}`]: string | number;
    }
  }
}
