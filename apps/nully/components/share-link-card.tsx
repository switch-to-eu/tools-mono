interface ShareLinkCardProps {
  url: string;
  onCopy?: () => void;
}

export function ShareLinkCard({ url, onCopy }: ShareLinkCardProps) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      onCopy?.();
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
    }
  };

  return (
    <div className="bg-blue-50 p-4 rounded-lg">
      <label className="block text-sm font-medium text-blue-700 mb-2">
        Share this link
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={url}
          readOnly
          className="flex-1 p-2 border rounded text-sm"
        />
        <button
          onClick={handleCopy}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Copy
        </button>
      </div>
    </div>
  );
}