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
        primary: "gradient-blue-yellow",
        primaryExtended: "gradient-purple-blue-green",
        secondary: "gradient-green-blue",
        accent: "gradient-green-yellow",

        // Background gradients
        heroBg: "gradient-bg-purple-blue",
    },
    backgrounds: {
        // Section backgrounds
        light: "bg-gradient-to-br from-neutral-50 to-blue-50/30",
        soft: "bg-gradient-to-r from-blue-50 to-purple-50",
        subtle: "bg-gradient-to-br from-green-50/30 to-neutral-50",
    },
    text: {
        primary: "text-primary-color",
        success: "text-green-600",
        danger: "text-red-600",
        warning: "text-orange-600",
    }
};
