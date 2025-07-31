"use client";

import { Github, ExternalLink } from "lucide-react";
import { cn } from "../lib/utils";
import { getTranslation } from "../lib/translations";
import { tools } from "../data/tools";

interface FooterProps {
  className?: string;
  locale?: string;
  aboutUrl?: string;
  privacyUrl?: string;
  appName?: string;
}

export function Footer({ className, locale = "en", aboutUrl, privacyUrl, appName }: FooterProps) {
  const switchToEuUrl = `https://switch-to.eu/${locale}`;
  const defaultAboutUrl = aboutUrl || `/${locale}/about`;
  const defaultPrivacyUrl = privacyUrl || `/${locale}/privacy`;

  const t = (key: string) => getTranslation(locale, key);

  return (
    <footer className={cn("bg-gray-900 text-gray-300", className)}>
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="mb-4">
              {appName ? (
                <div className="text-xl font-bold text-white">
                  {appName} by{" "}
                  <a
                    href={switchToEuUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-gray-200 transition-colors inline-flex items-center gap-1"
                  >
                    Switch-to.eu
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              ) : (
                <a
                  href={switchToEuUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xl font-bold text-white hover:text-gray-200 transition-colors"
                >
                  Switch-to.eu
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
            <p className="text-gray-400 max-w-md leading-relaxed">
              {t('footer.description')}
            </p>
            <p className="text-gray-500 max-w-md text-sm mt-3 leading-relaxed">
              {t('footer.confidence')}
            </p>
          </div>

          {/* Our EU Alternatives */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t('footer.toolsTitle')}</h3>
            <ul className="space-y-3">
              {tools.map((tool) => (
                <li key={tool.name}>
                  <a
                    href={tool.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block hover:text-white transition-colors"
                  >
                    <div className="font-medium group-hover:text-white">
                      {tool.name}
                    </div>
                    <div className="text-sm text-gray-500 group-hover:text-gray-300">
                      {t(`footer.tools.${tool.id}`)}
                    </div>
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-4 pt-3 border-t border-gray-800">
              <a
                href={switchToEuUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-gray-500 hover:text-gray-300 transition-colors inline-flex items-center gap-1"
              >
                {t('footer.browseMore')}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t('footer.links')}</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href={defaultAboutUrl}
                  className="hover:text-white transition-colors"
                >
                  {t('footer.about')}
                </a>
              </li>
              <li>
                <a
                  href={defaultPrivacyUrl}
                  className="hover:text-white transition-colors"
                >
                  {t('footer.privacy')}
                </a>
              </li>
              <li>
                <a
                  href="mailto:hi@switch-to.eu"
                  className="hover:text-white transition-colors"
                >
                  {t('footer.contact')}
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/switch-to-eu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors inline-flex items-center gap-2"
                >
                  <Github className="h-4 w-4" />
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              {t('footer.copyright')} <a
                href="https://vinnie.studio"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
              >
                Studio Vinnie
              </a> and <a
                href="https://mvpeters.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
              >
                MVPeters
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}