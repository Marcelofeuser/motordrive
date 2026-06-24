
(function () {
  const ua = navigator.userAgent || "";
  const isIOS = /iPhone|iPad|iPod/i.test(ua);
  const isStandalone = window.navigator.standalone === true;

  if (!isIOS || isStandalone) return;

  const style = document.createElement("style");
  style.textContent = `
    .ios-install-btn{
      position:fixed;right:16px;bottom:16px;z-index:9999;
      background:#facc15;color:#111827;border:0;border-radius:12px;
      padding:12px 16px;font-weight:700;box-shadow:0 8px 24px rgba(0,0,0,.18)
    }
    .ios-install-backdrop{
      position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:10000;
      display:flex;align-items:center;justify-content:center;padding:20px
    }
    .ios-install-card{
      width:min(92vw,420px);background:#0f172a;color:#fff;border-radius:18px;
      padding:18px;box-shadow:0 20px 50px rgba(0,0,0,.35);font-family:-apple-system,BlinkMacSystemFont,sans-serif
    }
    .ios-install-card h3{margin:0 0 10px;font-size:20px}
    .ios-install-card p{margin:0 0 12px;line-height:1.45}
    .ios-install-card ol{margin:0 0 14px 18px;padding:0;line-height:1.55}
    .ios-install-card .actions{display:flex;gap:10px;justify-content:flex-end}
    .ios-install-card button{border:0;border-radius:10px;padding:10px 14px;font-weight:700}
    .ios-install-primary{background:#facc15;color:#111827}
    .ios-install-secondary{background:#1f2937;color:#fff}
  `;
  document.head.appendChild(style);

  function openModal() {
    const backdrop = document.createElement("div");
    backdrop.className = "ios-install-backdrop";
    backdrop.innerHTML = `
      <div class="ios-install-card">
        <h3>Instalar MotorDrive no iPhone</h3>
        <p>Para instalar:</p>
        <ol>
          <li>Abra este site no <strong>Safari</strong></li>
          <li>Toque em <strong>Compartilhar</strong></li>
          <li>Toque em <strong>Adicionar à Tela de Início</strong></li>
          <li>Toque em <strong>Adicionar</strong></li>
        </ol>
        <div class="actions">
          <button class="ios-install-secondary" id="iosInstallClose">Fechar</button>
          <button class="ios-install-primary" id="iosInstallOk">OK</button>
        </div>
      </div>
    `;
    document.body.appendChild(backdrop);
    document.getElementById("iosInstallClose").onclick = () => backdrop.remove();
    document.getElementById("iosInstallOk").onclick = () => backdrop.remove();
    backdrop.onclick = (e) => { if (e.target === backdrop) backdrop.remove(); };
  }

  const btn = document.createElement("button");
  btn.className = "ios-install-btn";
  btn.textContent = " Instalar no iPhone";
  btn.onclick = openModal;
  document.body.appendChild(btn);
})();
