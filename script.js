// Function to load translations and initialize i18next with geolocation
async function initTranslations() {
  try {
    // Fetch user's country from an external API
    const geoResponse = await fetch("https://ipapi.co/json/");
    const geoData = await geoResponse.json();
    const countryCode = geoData.country_code.toLowerCase(); // e.g., "us", "br"

    const languageMap = {
      br: "pt", // Brazil -> Portuguese
      us: "en", // USA -> English
      gb: "en", // UK -> English
    };
    const detectedLanguage = languageMap[countryCode] || "en"; // Default to English

    // Load translation files
    const enTranslations = await fetch("./locales/en/translation.json").then(
      (res) => res.json()
    );
    const ptTranslations = await fetch("./locales/pt/translation.json").then(
      (res) => res.json()
    );

    await i18next.init({
      lng: detectedLanguage, // Use language based on location
      fallbackLng: "en", // Fallback to English if not supported
      resources: {
        en: { translation: enTranslations },
        pt: { translation: ptTranslations },
      },
    });

    // Apply translations after initialization
    updateTranslations();
    // Update HTML lang attribute to match detected language
    document.documentElement.lang = i18next.language;
  } catch (error) {
    console.error("Failed to load translations or geolocation:", error);
    // Fallback to browser language if geolocation fails
    const fallbackLang = navigator.language.split("-")[0] || "en";
    await i18next.init({
      lng: fallbackLang,
      fallbackLng: "en",
      resources: {
        en: {
          translation: await fetch("./locales/en/translation.json").then(
            (res) => res.json()
          ),
        },
        pt: {
          translation: await fetch("./locales/pt/translation.json").then(
            (res) => res.json()
          ),
        },
      },
    });
    updateTranslations();
    document.documentElement.lang = i18next.language;
  }
}

// Start the translation process
initTranslations();

// Function to update all elements with data-i18n and custom attributes
function updateTranslations() {
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.getAttribute("data-i18n");
    if (key.startsWith("[")) {
      const match = key.match(/\[(\w+-?\w*)\](.*)/); // Match attribute and key
      if (match) {
        const attr = match[1]; // e.g., "placeholder", "alt", "value"
        const translationKey = match[2]; // e.g., "contact.form.namePlaceholder"
        element.setAttribute(attr, i18next.t(translationKey));
      }
    } else {
      // Regular text content translation
      element.textContent = i18next.t(key);
    }
  });

  // Handle custom required messages
  document.querySelectorAll("[data-i18n-required]").forEach((element) => {
    const requiredKey = element.getAttribute("data-i18n-required");
    element.setCustomValidity(""); // Reset any previous message
    element.oninvalid = function (e) {
      e.target.setCustomValidity(i18next.t(requiredKey));
    };
    element.oninput = function (e) {
      e.target.setCustomValidity("");
    };
  });
}

// Show success banner if URL parameter indicates form submission
function checkUrlForSuccess() {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("success") === "true") {
    const banner = document.getElementById("successBanner");
    banner.classList.remove("hidden");

    setTimeout(() => {
      banner.classList.add("hidden");
      const url = new URL(window.location);
      url.searchParams.delete("success");
      window.history.replaceState({}, document.title, url);
    }, 5000); // Hide after 5 seconds
  }

  updateTranslations(); // Ensure translations are applied after page load
}

// Execute checkUrlForSuccess() when the page loads
window.onload = checkUrlForSuccess;
