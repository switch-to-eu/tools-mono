import { routing } from "@i18n/routing";
import messages from "./messages/en.json";
import uiMessages from "@workspace/ui/translations/en.json";

declare module "next-intl" {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    Messages: typeof messages & typeof uiMessages;
  }
}

// Color scheme constants
export const colors = {
  gradients: {
    // Main brand gradients
    primary: "gradient-green-emerald",
    primaryExtended: "gradient-green-emerald-teal",
    secondary: "gradient-emerald-teal", 
    accent: "gradient-green-lime",
    
    // Background gradients
    heroBg: "gradient-bg-green-emerald",
  },
  backgrounds: {
    // Section backgrounds
    light: "bg-gradient-to-br from-neutral-50 to-green-50/30",
    soft: "bg-gradient-to-r from-green-50 to-emerald-50",
    subtle: "bg-gradient-to-br from-emerald-50/30 to-neutral-50",
  },
  text: {
    primary: "text-primary-color",
    success: "text-green-600",
    danger: "text-red-600",
    warning: "text-orange-600",
  }
};
