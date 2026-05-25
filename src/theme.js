import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  config: {
    initialColorMode: "light",
    useSystemColorMode: false,
  },
  fonts: {
    heading: "Space Grotesk, sans-serif",
    body: "Spline Sans, sans-serif",
  },
  colors: {
    brand: {
      50: "#eef7f6",
      100: "#d4ebe7",
      200: "#b2d7d1",
      300: "#89beb5",
      400: "#5ca298",
      500: "#3c857c",
      600: "#2d6b64",
      700: "#235651",
      800: "#1a4340",
      900: "#12302f",
    },
    ink: {
      900: "#12121a",
      800: "#1d1d29",
      700: "#2a2a3a",
      600: "#3a3a4d",
    },
    sand: {
      50: "#faf8f4",
      100: "#f3eee6",
      200: "#e8decc",
      300: "#ddcfb3",
      400: "#d3c29f",
    },
  },
  semanticTokens: {
    colors: {
      "bg.canvas": {
        default: "sand.50",
        _dark: "ink.900",
      },
      "bg.surface": {
        default: "white",
        _dark: "ink.800",
      },
      "text.primary": {
        default: "ink.900",
        _dark: "white",
      },
      "text.muted": {
        default: "ink.600",
        _dark: "sand.200",
      },
      "border.subtle": {
        default: "sand.200",
        _dark: "ink.700",
      },
    },
  },
  styles: {
    global: {
      body: {
        bg: "bg.canvas",
        color: "text.primary",
      },
    },
  },
});

export default theme;
