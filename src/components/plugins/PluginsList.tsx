import { useEffect, useState } from "react";

export interface RegisteredPlugin {
  displayName: string;
  iconUrl: string;
  fireflyAccountName: string;
  baseUrlPattern: string;
  apiUrlPattern: string;
}

export default function PluginsList() {
  const [plugins, setPlugins] = useState<RegisteredPlugin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPlugins = async () => {
      try {
        if (!chrome?.storage?.local) {
          console.warn("Chrome storage API not available");
          setLoading(false);
          return;
        }

        const result = await chrome.storage.local.get("registeredPlugins");
        if (result.registeredPlugins) {
          setPlugins(result.registeredPlugins);
        }
      } catch (error) {
        console.error("Failed to load registered plugins:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPlugins();
  }, []);

  if (loading) {
    return (
      <div className="py-5 px-4 text-center">
        <p>Loading plugins...</p>
      </div>
    );
  }

  if (plugins.length === 0) {
    return (
      <div className="py-5 px-4 text-center text-gray-500">
        <p>No plugins registered.</p>
      </div>
    );
  }

  return (
    <div className="py-5 px-4 max-h-screen flex flex-col overflow-hidden">
      <h1 className="text-3xl font-bold mb-3 text-center">
        Registered Plugins
      </h1>

      {/* Non-supported page notice */}
      <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="text-amber-600">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm text-amber-800 font-medium">
              You&apos;re currently on a non-supported page
            </p>
            <p className="text-xs text-amber-700 mt-1">
              Navigate to one of the supported financial websites below to start
              capturing transactions automatically.
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-auto flex-grow">
        <div className="space-y-4">
          {plugins.map((plugin, index) => (
            <div
              key={index}
              className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                {plugin.iconUrl && (
                  <img
                    src={plugin.iconUrl}
                    alt={`${plugin.displayName} icon`}
                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                    onError={(e) => {
                      // Hide image if it fails to load
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                )}
                <div className="flex-grow min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {plugin.displayName}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Account: {plugin.fireflyAccountName}
                  </p>
                  <div className="mt-2 space-y-1">
                    <div className="text-xs text-gray-500">
                      <span className="font-medium">Base URL Pattern:</span>{" "}
                      <code className="bg-gray-100 px-1 rounded">
                        {plugin.baseUrlPattern}
                      </code>
                    </div>
                    <div className="text-xs text-gray-500">
                      <span className="font-medium">API URL Pattern:</span>{" "}
                      <code className="bg-gray-100 px-1 rounded">
                        {plugin.apiUrlPattern}
                      </code>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
