import themes from "daisyui/src/theming/themes.js";
import { ConfigProps } from "./types/config";

const config: ConfigProps = {
  appName: "Wai",
  appDescription:
    "Wai is a safe, friendly, and infinitely patient question answering machine for parents and kids.",
  domainName: "wai.hatchmatter.com",
  colors: {
    // REQUIRED — The DaisyUI theme to use (added to the main layout.js). Leave blank for default (light & dark mode). If you any other theme than light/dark, you need to add it in config.tailwind.js in daisyui.themes.
    // theme: "light",
    // REQUIRED — This color will be reflected on the whole app outside of the document (loading bar, Chrome tabs, etc..). By default it takes the primary color from your DaisyUI theme (make sure to update your the theme name after "data-theme=")
    // OR you can just do this to use a custom color: main: "#f37055". HEX only.
    main: themes[`[data-theme=light]`]["primary"],
  },
  auth: {
    loginUrl: "/signin",
    callbackUrl: "/talk",
  },
} as ConfigProps;

export default config;
