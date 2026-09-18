// Nav open/close, aria-expanded, and aria-details are all native now —
// the toggle button's popovertarget wires it declaratively. See ADR-0006.

const hueInput = document.getElementById("hue");
const hueOut = document.querySelector('output[for="hue"]');
function setHue(hue) {
  document.documentElement.style.setProperty("--p-brand-hue", String(hue));
  if (hueOut) hueOut.textContent = hue;
  if (hueInput) hueInput.value = hue;
}
hueInput?.addEventListener("input", (e) => setHue(e.target.value));
document.querySelectorAll("[data-hue]").forEach((btn) => {
  btn.addEventListener("click", () => setHue(btn.dataset.hue));
});

document.getElementById("open-confirm")?.addEventListener("click", () => {
  document.getElementById("confirm-demo")?.show?.();
});
document.getElementById("open-el-dialog")?.addEventListener("click", () => {
  document.getElementById("el-dialog")?.show?.();
});
