import type { PluginStateEvent } from "@/chrome/core/types/requestBodyPipeline";

interface HeaderProps {
  plugin: PluginStateEvent["plugin"];
}

export default function Header({ plugin }: HeaderProps) {
  return (
    <div className="text-center mb-4">
      <h1 className="text-3xl font-bold text-gray-900">OpenFin</h1>
      {plugin && (
        <div className="flex items-center justify-center gap-2 mt-2">
          {plugin.iconUrl && (
            <img
              src={plugin.iconUrl}
              alt={`${plugin.displayName} icon`}
              className="w-5 h-5 rounded object-cover flex-shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          )}
          <span className="text-sm text-gray-600">{plugin.displayName}</span>
          <span className="text-xs text-gray-400">•</span>
          <span className="text-xs text-gray-500">
            {plugin.fireflyAccountName}
          </span>
          <div className="flex items-center gap-1 ml-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs text-green-600 font-medium">
              Connected
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
