if (typeof window !== "undefined") {
  // Güvenli setImmediate ponyfill (postMessage KULLANMAZ)
  if (!("setImmediate" in window)) {
    (window as any).setImmediate = (
      cb: (...a: any[]) => void,
      ...args: any[]
    ) => setTimeout(cb, 0, ...args);
    (window as any).clearImmediate = (id: number) => clearTimeout(id);
  }

  // setImmediate polyfill'lerinin gönderdiği postMessage stringlerini engelle
  const trap = (e: MessageEvent) => {
    if (typeof e.data === "string" && e.data.startsWith("setImmediate$")) {
      e.stopImmediatePropagation();
    }
  };
  window.addEventListener("message", trap, true); // capture fazında
}
