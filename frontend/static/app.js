(function () {
  const defaults = [
    "spring.application",
    "spring.cloud",
    "spring.profiles",
    "management.",
    "logging."
  ];

  const form = document.getElementById("analyze-form");
  const serviceInput = document.getElementById("service_name");
  const envUrlInput = document.getElementById("env_url");
  const prefixesInput = document.getElementById("general_prefixes");
  const keysInput = document.getElementById("general_keys");
  const submitBtn = document.getElementById("submit-btn");
  const statusEl = document.getElementById("status");

  const resultCard = document.getElementById("result-card");
  const resultService = document.getElementById("result-service");
  const resultMeta = document.getElementById("result-meta");
  const resultCounts = document.getElementById("result-counts");
  const summaryList = document.getElementById("summary-list");
  const applicationArea = document.getElementById("application_yaml");
  const microserviceTitle = document.getElementById("microservice-title");
  const microserviceArea = document.getElementById("microservice_yaml");

  prefixesInput.value = defaults.join("\n");

  function linesToArray(value) {
    return value
      .split("\n")
      .map((v) => v.trim())
      .filter(Boolean);
  }

  function setLoading(isLoading) {
    submitBtn.disabled = isLoading;
    statusEl.classList.toggle("error", false);
    statusEl.textContent = isLoading ? "Procesando..." : "";
  }

  function renderResult(data) {
    const microYamlName = `${data.service_name}.yml`;
    resultService.textContent = data.service_name;
    resultMeta.textContent = `Fuente: ${data.fetched_from}`;
    resultCounts.textContent = `Total: ${data.property_count} · Compartidas: ${data.general_property_count} · Específicas: ${data.service_specific_count}`;

    summaryList.innerHTML = "";
    Object.entries(data.summary || {}).forEach(([name, description]) => {
      const li = document.createElement("li");
      li.textContent = `${name}: ${description}`;
      summaryList.appendChild(li);
    });

    applicationArea.value = data.application_yaml || "";
    microserviceTitle.textContent = microYamlName;
    microserviceArea.value = data.microservice_yaml || "";

    resultCard.hidden = false;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const payload = {
      service_name: serviceInput.value.trim(),
      env_url: envUrlInput.value.trim()
    };

    const generalPrefixes = linesToArray(prefixesInput.value);
    if (generalPrefixes.length) {
      payload.general_prefixes = generalPrefixes;
    }

    const generalKeys = linesToArray(keysInput.value);
    if (generalKeys.length) {
      payload.general_keys = generalKeys;
    }

    if (!payload.service_name || !payload.env_url) {
      statusEl.textContent = "Completa los campos obligatorios.";
      statusEl.classList.add("error");
      return;
    }

    setLoading(true);
    resultCard.hidden = true;

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
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
      renderResult(data);
      statusEl.textContent = "Listo";
    } catch (error) {
      statusEl.textContent = error?.message || "No pudimos contactar el backend.";
      statusEl.classList.add("error");
    } finally {
      submitBtn.disabled = false;
    }
  });
})();
