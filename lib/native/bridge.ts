/**
 * Minimal client-side access to Capacitor plugins.
 *
 * The app shell loads the live website, so the native layer injects
 * `window.Capacitor` into these pages. We talk to it directly instead of
 * bundling @capacitor/* into the website: the site keeps zero new runtime
 * dependencies and every call is a no-op in an ordinary browser.
 */

type Listener = (data: unknown) => void;

type CapacitorGlobal = {
  isNativePlatform?: () => boolean;
  getPlatform?: () => string;
  Plugins?: Record<string, Record<string, unknown> | undefined>;
  nativePromise?: (plugin: string, method: string, options?: unknown) => Promise<unknown>;
  nativeCallback?: (
    plugin: string,
    method: string,
    options: unknown,
    callback: (data: unknown, error?: unknown) => void,
  ) => string;
};

function capacitor(): CapacitorGlobal | null {
  if (typeof window === "undefined") return null;
  const cap = (window as unknown as { Capacitor?: CapacitorGlobal }).Capacitor;
  if (!cap || typeof cap.isNativePlatform !== "function") return null;
  try {
    return cap.isNativePlatform() ? cap : null;
  } catch {
    return null;
  }
}

export function isNativeShell(): boolean {
  return capacitor() !== null;
}

export function nativePlatform(): "ios" | "android" | null {
  const platform = capacitor()?.getPlatform?.();
  return platform === "ios" || platform === "android" ? platform : null;
}

export async function callPlugin<T = unknown>(
  plugin: string,
  method: string,
  options: Record<string, unknown> = {},
): Promise<T> {
  const cap = capacitor();
  if (!cap) throw new Error("not_native");
  const proxy = cap.Plugins?.[plugin];
  const fn = proxy?.[method];
  if (typeof fn === "function") {
    return (await (fn as (o: unknown) => Promise<T>).call(proxy, options)) as T;
  }
  if (typeof cap.nativePromise === "function") {
    return (await cap.nativePromise(plugin, method, options)) as T;
  }
  throw new Error("bridge_unavailable");
}

/** Subscribes to a plugin event; resolves to an unsubscribe function. */
export async function addPluginListener(
  plugin: string,
  eventName: string,
  listener: Listener,
): Promise<() => void> {
  const cap = capacitor();
  if (!cap) return () => {};

  const proxy = cap.Plugins?.[plugin];
  const add = proxy?.addListener;
  if (typeof add === "function") {
    const handle = (await (add as (e: string, l: Listener) => Promise<{ remove?: () => unknown }>).call(
      proxy,
      eventName,
      listener,
    )) as { remove?: () => unknown } | undefined;
    return () => {
      try {
        void handle?.remove?.();
      } catch {
        /* already removed */
      }
    };
  }

  if (typeof cap.nativeCallback === "function") {
    const callbackId = cap.nativeCallback(plugin, "addListener", { eventName }, (data) =>
      listener(data),
    );
    return () => {
      void cap
        .nativePromise?.(plugin, "removeListener", { callbackId, eventName })
        .catch(() => {});
    };
  }

  return () => {};
}
