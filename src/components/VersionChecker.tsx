import { useEffect } from "react";

const CURRENT_VERSION = "1.0";

export function VersionChecker() {
  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch("/version.json?t=" + Date.now());
        const data = await res.json();
        if (data.version && data.version !== CURRENT_VERSION) {
          const ok = window.confirm(
            "Nova versao disponivel (" + data.version + ")! Deseja baixar agora?"
          );
          if (ok) window.open(data.apk_url, "_blank");
        }
      } catch (e) {
        console.log("Version check failed", e);
      }
    };
    // Checa ao abrir e a cada 1 hora
    check();
    const interval = setInterval(check, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return null;
}