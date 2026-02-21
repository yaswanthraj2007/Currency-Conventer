const API_KEY = "89d6455b8efd3ef5afda6fab";
const API_BASE = `https://v6.exchangerate-api.com/v6/${API_KEY}`;

const fromEl = document.getElementById("from");
const toEl = document.getElementById("to");
const resultEl = document.getElementById("result");
const convertBtn = document.getElementById("convert");
const statusEl = document.getElementById("api-status");

// ── Populate dropdowns with supported currencies from API ──────
async function populateDropdowns() {
  try {
    setStatus("loading");
    const res = await fetch(`${API_BASE}/latest/USD`);
    const data = await res.json();

    if (data.result !== "success") throw new Error(data["error-type"]);

    const currencies = Object.keys(data.conversion_rates).sort();

    currencies.forEach(currency => {
      [fromEl, toEl].forEach(select => {
        const option = document.createElement("option");
        option.value = currency;
        option.textContent = currency;
        select.appendChild(option);
      });
    });

    fromEl.value = "USD";
    toEl.value = "INR";
    setStatus("live");

  } catch (err) {
    setStatus("error");
    resultEl.textContent = "⚠️ Failed to load currencies. Check your API key or internet connection.";
    console.error("API Error:", err);
  }
}

// ── Convert using live rates ───────────────────────────────────
async function convert() {
  const amount = parseFloat(document.getElementById("amount").value);
  const from = fromEl.value;
  const to = toEl.value;

  if (!amount || amount <= 0) {
    resultEl.textContent = "⚠️ Enter a valid amount.";
    return;
  }

  // Loading state
  convertBtn.textContent = "Loading…";
  convertBtn.disabled = true;
  resultEl.textContent = "";

  try {
    const res = await fetch(`${API_BASE}/latest/${from}`);
    const data = await res.json();

    if (data.result !== "success") throw new Error(data["error-type"]);

    const rate = data.conversion_rates[to];
    const converted = (amount * rate).toFixed(2);

    resultEl.textContent = `${amount} ${from} = ${converted} ${to}`;
    setStatus("live");

  } catch (err) {
    resultEl.textContent = "⚠️ Conversion failed. Check connection or API key.";
    setStatus("error");
    console.error("Conversion Error:", err);
  } finally {
    convertBtn.textContent = "Convert";
    convertBtn.disabled = false;
  }
}

// ── Status badge helper ────────────────────────────────────────
function setStatus(state) {
  const states = {
    live: { text: "🟢 Live Rates", cls: "status-live" },
    loading: { text: "🟡 Loading…", cls: "status-loading" },
    error: { text: "🔴 Offline / Error", cls: "status-error" },
  };
  const s = states[state];
  statusEl.textContent = s.text;
  statusEl.className = `api-status ${s.cls}`;
}

// ── Event listener ─────────────────────────────────────────────
convertBtn.addEventListener("click", convert);

// ── Init ───────────────────────────────────────────────────────
populateDropdowns();
