"use client";

import { ExternalLink, ArrowRight } from "lucide-react";
import { tools, type Tool } from "@workspace/ui/data/tools";
import { useTranslations } from "next-intl";
import Image from "next/image";


const colorSchemes = {
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-600',
    darkText: 'text-blue-900',
    button: 'bg-blue-600 hover:bg-blue-700'
  },
  green: {
    bg: 'bg-green-50',
    border: 'border-green-200', 
    text: 'text-green-600',
    darkText: 'text-green-900',
    button: 'bg-green-600 hover:bg-green-700'
  },
  purple: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-600', 
    darkText: 'text-purple-900',
    button: 'bg-purple-600 hover:bg-purple-700'
  },
  gray: {
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    text: 'text-gray-500',
    darkText: 'text-gray-700',
    button: 'bg-gray-400'
  }
};

interface ToolShowcaseProps {
  className?: string;
}

function ToolCard({ tool, index }: { tool: Tool; index: number }) {
  const t = useTranslations('tools');
  const colors = colorSchemes[tool.color as keyof typeof colorSchemes] || colorSchemes.gray;
  const isActive = tool.status === 'active' || tool.status === 'beta';
  const isReversed = index % 2 === 1;

  const handleClick = () => {
    if (isActive && tool.url !== '#') {
      window.open(tool.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div 
      className={`group relative overflow-hidden rounded-lg bg-white border ${colors.border} shadow-sm hover:shadow-md transition-shadow ${
        isActive ? 'cursor-pointer' : 'opacity-60'
      }`}
      onClick={handleClick}
    >
      <div className={`absolute inset-0 ${colors.bg}`} />
      
      <div className={`relative flex ${isReversed ? 'flex-row-reverse' : 'flex-row'} items-center min-h-[200px]`}>
        {/* Screenshot Side */}
        <div className={`flex-shrink-0 w-2/5 h-full flex items-center justify-center p-6`}>
          <div className="relative w-full h-32 rounded-lg overflow-hidden shadow-md border border-gray-200">
            <Image
              src={`/${tool.id}-screenshot.png`}
              alt={`${tool.name} screenshot`}
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Content Side */}
        <div className="flex-1 p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className={`text-xl font-bold ${colors.darkText}`}>
              {tool.name}
            </h3>
            {isActive && (
              <ExternalLink className={`h-4 w-4 ${colors.text} opacity-60`} />
            )}
          </div>

          <p className={`text-base font-medium ${colors.text} mb-2`}>
            {t(`${tool.id}.tagline`)}
          </p>

          <p className="text-gray-600 mb-4 text-sm leading-relaxed">
            {t(`${tool.id}.description`)}
          </p>

          {isActive ? (
            <button className={`inline-flex items-center gap-2 px-4 py-2 rounded-md font-medium text-white ${colors.button} transition-colors text-sm`}>
              {t(`${tool.id}.cta`)}
              <ArrowRight className="h-3 w-3" />
            </button>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-md font-medium text-gray-500 bg-gray-100 text-sm">
              {t('more.cta')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ToolShowcase({ className }: ToolShowcaseProps) {
  return (
    <div className={`space-y-6 max-w-4xl mx-auto ${className}`}>
      {tools.map((tool, index) => (
        <ToolCard key={tool.id} tool={tool} index={index} />
      ))}
    </div>
  );
}