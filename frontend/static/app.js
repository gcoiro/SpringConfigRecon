(function () {
  const form = document.getElementById("inspect-form");
  const envUrlInput = document.getElementById("env_url");
  const submitBtn = document.getElementById("submit-btn");
  const statusEl = document.getElementById("status");

  const resultCard = document.getElementById("result-card");
  const resultTitle = document.getElementById("result-title");
  const resultMeta = document.getElementById("result-meta");
  const resultCount = document.getElementById("result-count");
  const propertiesBody = document.getElementById("properties-body");

  function setLoading(isLoading) {
    submitBtn.disabled = isLoading;
    statusEl.classList.toggle("error", false);
    statusEl.textContent = isLoading ? "Procesando..." : "";
  }

  function formatValue(value) {
    if (value === null || value === undefined) return "";
    if (typeof value === "object") {
      try {
        return JSON.stringify(value);
      } catch (err) {
        return String(value);
      }
    }
    return String(value);
  }

  function renderProperties(properties) {
    propertiesBody.innerHTML = "";

    if (!properties.length) {
      const row = document.createElement("tr");
      const cell = document.createElement("td");
      cell.colSpan = 3;
      cell.textContent = "No se recibieron propiedades desde /actuator/env.";
      row.appendChild(cell);
      propertiesBody.appendChild(row);
      return;
    }

    properties.forEach((prop) => {
      const row = document.createElement("tr");

      const keyCell = document.createElement("td");
      keyCell.textContent = prop.key;
      keyCell.classList.add("mono");

      const valueCell = document.createElement("td");
      valueCell.textContent = formatValue(prop.value);
      valueCell.classList.add("mono");

      const sourceCell = document.createElement("td");
      sourceCell.innerHTML = `<div>${prop.source || "sin origen"}</div>`;
      if (prop.origin) {
        const origin = document.createElement("div");
        origin.textContent = prop.origin;
        origin.classList.add("muted");
        sourceCell.appendChild(origin);
      }

      row.appendChild(keyCell);
      row.appendChild(valueCell);
      row.appendChild(sourceCell);
      propertiesBody.appendChild(row);
    });
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const envUrl = envUrlInput.value.trim();
    if (!envUrl) {
      statusEl.textContent = "Ingresa la URL del actuator.";
      statusEl.classList.add("error");
      return;
    }

    setLoading(true);
    resultCard.hidden = true;

    try {
      const response = await fetch("/api/env", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ env_url: envUrl })
      });

      if (!response.ok) {
        let detail = `Error ${response.status}`;
        try {
          const data = await response.json();
          detail = data.detail || detail;
        } catch (err) {
          // ignore parsing errors
        }
        throw new Error(detail);
      }

      const data = await response.json();
      resultTitle.textContent = envUrl;
      resultMeta.textContent = `Fuente: ${data.fetched_from}`;
      resultCount.textContent = `Propiedades activas: ${data.property_count}`;

      renderProperties(data.properties || []);
      resultCard.hidden = false;
      statusEl.textContent = "Listo";
    } catch (error) {
      statusEl.textContent = error?.message || "No pudimos contactar el backend.";
      statusEl.classList.add("error");
    } finally {
      submitBtn.disabled = false;
    }
  });
})();
