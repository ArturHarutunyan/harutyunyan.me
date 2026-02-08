/* Google Analytics event tracking helper */
(function () {
  function trackEvent(eventName, eventParams) {
    if (typeof gtag !== "undefined") {
      gtag("event", eventName, eventParams);
    }
  }

  /* Track navigation link clicks */
  function trackNavigationLinks() {
    const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
    navLinks.forEach((link) => {
      link.addEventListener("click", function () {
        const section = this.getAttribute("href").replace("#", "");
        trackEvent("navigation_click", {
          event_category: "Navigation",
          event_label: section,
          link_text: this.textContent.trim(),
        });
      });
    });
  }

  /* Track button clicks */
  function trackButtons() {
    const buttons = document.querySelectorAll(".btn");
    buttons.forEach((btn) => {
      btn.addEventListener("click", function () {
        const href = this.getAttribute("href");
        const text = this.textContent.trim();
        const isPrimary = this.classList.contains("primary");
        const isGhost = this.classList.contains("ghost");
        const isDownload = this.hasAttribute("download");
        const isExternal = this.hasAttribute("target") && this.getAttribute("target") === "_blank";

        let eventCategory = "Button";
        let eventLabel = text;

        if (isDownload) {
          eventCategory = "Download";
          eventLabel = href || text;
          trackEvent("file_download", {
            event_category: "Download",
            event_label: eventLabel,
            file_name: href ? href.split("/").pop() : "unknown",
          });
        } else if (href && href.startsWith("http")) {
          eventCategory = "External Link";
          trackEvent("external_link_click", {
            event_category: "External Link",
            event_label: href,
            link_text: text,
            link_type: isPrimary ? "primary" : isGhost ? "ghost" : "secondary",
          });
        } else if (href && href.startsWith("#")) {
          eventCategory = "Internal Link";
          trackEvent("internal_link_click", {
            event_category: "Internal Link",
            event_label: href.replace("#", ""),
            link_text: text,
            link_type: isPrimary ? "primary" : isGhost ? "ghost" : "secondary",
          });
        } else {
          trackEvent("button_click", {
            event_category: "Button",
            event_label: text,
            button_type: isPrimary ? "primary" : isGhost ? "ghost" : "secondary",
          });
        }
      });
    });
  }

  /* Track external links (social media, email, etc.) */
  function trackExternalLinks() {
    const externalLinks = document.querySelectorAll('a[href^="http"], a[href^="mailto:"]');
    externalLinks.forEach((link) => {
      // Skip if already tracked by button tracking
      if (link.classList.contains("btn")) return;

      link.addEventListener("click", function () {
        const href = this.getAttribute("href");
        const text = this.textContent.trim();
        const isEmail = href.startsWith("mailto:");

        if (isEmail) {
          trackEvent("email_click", {
            event_category: "Contact",
            event_label: href.replace("mailto:", ""),
            link_text: text,
          });
        } else {
          // Extract domain for better tracking
          try {
            const url = new URL(href);
            trackEvent("external_link_click", {
              event_category: "External Link",
              event_label: url.hostname,
              link_url: href,
              link_text: text,
            });
          } catch (e) {
            trackEvent("external_link_click", {
              event_category: "External Link",
              event_label: href,
              link_text: text,
            });
          }
        }
      });
    });
  }

  /* Track section views (when sections come into viewport) */
  function trackSectionViews() {
    const sections = document.querySelectorAll("section[id]");
    const viewedSections = new Set();

    const observerOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 0.3, // Trigger when 30% of section is visible
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !viewedSections.has(entry.target.id)) {
          viewedSections.add(entry.target.id);
          trackEvent("section_view", {
            event_category: "Engagement",
            event_label: entry.target.id,
            section_name: entry.target.querySelector(".section-title")?.textContent.trim() || entry.target.id,
          });
        }
      });
    }, observerOptions);

    sections.forEach((section) => {
      observer.observe(section);
    });
  }

  /* Track form interactions */
  function trackFormInteractions() {
    const form = document.getElementById("contactForm");
    if (!form) return;

    const nameInput = form.querySelector('input[name="name"]');
    const emailInput = form.querySelector('input[name="email"]');
    const messageInput = form.querySelector('textarea[name="message"]');

    // Track form start (when user starts typing)
    let formStarted = false;
    [nameInput, emailInput, messageInput].forEach((input) => {
      if (input) {
        input.addEventListener("focus", function () {
          if (!formStarted) {
            formStarted = true;
            trackEvent("form_start", {
              event_category: "Form",
              event_label: "Contact Form",
            });
          }
        });
      }
    });

    // Track form field interactions
    if (nameInput) {
      nameInput.addEventListener("blur", function () {
        if (this.value.trim()) {
          trackEvent("form_field_complete", {
            event_category: "Form",
            event_label: "Name",
            field_name: "name",
          });
        }
      });
    }

    if (emailInput) {
      emailInput.addEventListener("blur", function () {
        if (this.value.trim()) {
          trackEvent("form_field_complete", {
            event_category: "Form",
            event_label: "Email",
            field_name: "email",
          });
        }
      });
    }

    if (messageInput) {
      messageInput.addEventListener("blur", function () {
        if (this.value.trim()) {
          trackEvent("form_field_complete", {
            event_category: "Form",
            event_label: "Message",
            field_name: "message",
          });
        }
      });
    }
  }

  /* Initialize all tracking */
  function initAnalytics() {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", function () {
        trackNavigationLinks();
        trackButtons();
        trackExternalLinks();
        trackSectionViews();
        trackFormInteractions();
      });
    } else {
      trackNavigationLinks();
      trackButtons();
      trackExternalLinks();
      trackSectionViews();
      trackFormInteractions();
    }
  }

  initAnalytics();
})();

/* Contact form submit + status UX */
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

  function trackEvent(eventName, eventParams) {
    if (typeof gtag !== "undefined") {
      gtag("event", eventName, eventParams);
    }
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

    // Track form submission attempt
    trackEvent("form_submit", {
      event_category: "Form",
      event_label: "Contact Form",
    });

    if (gotcha) {
      // Honeypot triggered; pretend success without doing anything.
      setStatus("success", "Message sent. I'll reply as soon as I can.");
      form.reset();
      trackEvent("form_submit_spam", {
        event_category: "Form",
        event_label: "Spam Detected",
      });
      return;
    }

    if (!name || !email || !message) {
      setStatus("error", "Please fill in name, email, and message.");
      trackEvent("form_submit_error", {
        event_category: "Form",
        event_label: "Validation Error",
        error_type: "missing_fields",
      });
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
      trackEvent("form_submit_error", {
        event_category: "Form",
        event_label: "Configuration Error",
        error_type: "missing_config",
      });
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
        setStatus("success", "Message sent. I'll reply as soon as I can.");
        trackEvent("form_submit_success", {
          event_category: "Form",
          event_label: "Contact Form",
        });
      } else {
        setStatus("error", "Couldn't send the message. Please try again, or email me directly.");
        trackEvent("form_submit_error", {
          event_category: "Form",
          event_label: "Server Error",
          error_type: "server_error",
          status_code: res.status,
        });
      }
    } catch (err) {
      setStatus("error", "Network error. Please try again, or email me directly.");
      trackEvent("form_submit_error", {
        event_category: "Form",
        event_label: "Network Error",
        error_type: "network_error",
      });
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    }
  }

  form.addEventListener("submit", onSubmit);
})();
