/* Minimal JS: contact form submit + status UX. */
(function () {
  const form = document.getElementById("contactForm");
  if (!form) return;

  const statusEl = document.getElementById("contactStatus");
  const submitBtn = document.getElementById("contactSubmit");

  function setStatus(kind, message) {
    if (!statusEl) return;
    statusEl.classList.remove("success", "error");
    if (kind === "success") statusEl.classList.add("success");
    if (kind === "error") statusEl.classList.add("error");
    statusEl.textContent = message;
    statusEl.setAttribute("aria-hidden", "false");
  }

  function clearStatus() {
    if (!statusEl) return;
    statusEl.textContent = "";
    statusEl.setAttribute("aria-hidden", "true");
    statusEl.classList.remove("success", "error");
  }

  async function onSubmit(e) {
    e.preventDefault();
    clearStatus();

    const endpoint = form.getAttribute("action") || "";
    const name = String(form.querySelector('input[name="name"]')?.value || "").trim();
    const email = String(form.querySelector('input[name="email"]')?.value || "").trim();
    const message = String(form.querySelector('textarea[name="message"]')?.value || "").trim();
    const gotcha = String(form.querySelector('input[name="_gotcha"]')?.value || "").trim();
    const accessKey = String(form.querySelector('input[name="access_key"]')?.value || "").trim();

    if (gotcha) {
      // Honeypot triggered; pretend success without doing anything.
      setStatus("success", "Message sent. I’ll reply as soon as I can.");
      form.reset();
      return;
    }

    if (!name || !email || !message) {
      setStatus("error", "Please fill in name, email, and message.");
      return;
    }

    // Provider configuration checks (frontend-only email needs a provider).
    const needsWeb3FormsKey =
      endpoint.includes("api.web3forms.com/submit") &&
      (!accessKey || accessKey === "WEB3FORMS_ACCESS_KEY");
    const needsFormspreeId = endpoint.includes("formspree.io/f/") && endpoint.includes("FORM_ID");

    if (needsWeb3FormsKey || needsFormspreeId) {
      setStatus(
        "error",
        "Contact form is not configured yet. Follow README to set the provider key/ID (Web3Forms access_key or Formspree form id)."
      );
      return;
    }

    const originalText = submitBtn ? submitBtn.textContent : "";
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending…";
    }

    try {
      const data = new FormData(form);
      const res = await fetch(endpoint, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });

      if (res.ok) {
        form.reset();
        setStatus("success", "Message sent. I’ll reply as soon as I can.");
      } else {
        setStatus("error", "Couldn’t send the message. Please try again, or email me directly.");
      }
    } catch (err) {
      setStatus("error", "Network error. Please try again, or email me directly.");
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    }
  }

  form.addEventListener("submit", onSubmit);
})();
