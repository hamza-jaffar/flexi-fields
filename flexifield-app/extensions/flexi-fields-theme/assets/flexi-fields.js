document.addEventListener("DOMContentLoaded", function () {
  const container = document.getElementById("flexi-fields-container");
  if (!container) return;

  const { shop, productId, collectionIds, tags, apiUrl } = container.dataset;
  const baseApiUrl = apiUrl.replace(/\/custom-fields\/?$/, "").replace(/\/$/, "");
  let addonVariantId = container.dataset.addonVariantId;
  const ADDON_TITLE = "Flexi Fields Addon";

  let isUploading = false;
  let customFieldsData = [];
  let shopSettings = {
    summary_label: "Price add-ons",
    required_error_label: "is required",
    addon_product_name: "Flexi Fields Addon"
  };

  const originalFetch = window.fetch;
  const OriginalXHR = window.XMLHttpRequest;

  // ─── Fetch fields from API ────────────────────────────────────────────────
  const fetchFields = async () => {
    try {
      const url = new URL(`${baseApiUrl}/custom-fields`);
      url.searchParams.append("shop", shop);
      url.searchParams.append("product_id", productId);
      if (collectionIds) url.searchParams.append("collection_ids", collectionIds);
      if (tags) url.searchParams.append("tags", tags);

      const response = await fetch(url, {
        headers: { "ngrok-skip-browser-warning": "true", Accept: "application/json" },
      });
      if (!response.ok) throw new Error("Failed to fetch fields");

      const data = await response.json();
      
      // Prefer the ID from the API if available
      if (data.addon_variant_id) {
        addonVariantId = data.addon_variant_id;
      }

      if (data.fields && data.fields.length > 0) {
        customFieldsData = data.fields;
        if (data.settings) shopSettings = { ...shopSettings, ...data.settings };
        
        renderFields(data.fields);
        integrateWithForm();
        setupIntercepts();
        setupPriceSummary();

        // Warn early if price addons exist but no addon variant is configured
        const hasPriceAddon = data.fields.some((f) => f.has_price_addon && f.price);
        if (hasPriceAddon && !addonVariantId) {
          console.warn(
            "Flexi Fields: Some fields have price addons but no Addon Variant ID is set. " +
            "Create a hidden product priced at $1.00, copy its Variant ID, and paste it " +
            "into the 'Addon Variant ID' block setting in the Shopify theme editor."
          );
        }
      } else {
        container.style.display = "none";
      }
    } catch (error) {
      console.error("Flexi Fields: Error fetching fields:", error);
      container.style.display = "none";
    }
  };

  // ─── Move container inside the product form ───────────────────────────────
  const integrateWithForm = () => {
    const form = document.querySelector('form[action*="/cart/add"]');
    if (form && !form.contains(container)) {
      const submitBtn = form.querySelector('[name="add"], button[type="submit"]');
      submitBtn
        ? submitBtn.parentNode.insertBefore(container, submitBtn)
        : form.appendChild(container);
    }
  };

  // ─── Read a single field's current value ──────────────────────────────────
  const getFieldValue = (field) => {
    const labelWithPrice = field.has_price_addon
      ? `${field.label} (+${field.price})`
      : field.label;
    const name = `properties[${labelWithPrice}]`;

    if (field.type === "radio") {
      const el = container.querySelector(`input[name="${name}"]:checked`);
      return el ? el.value : "";
    }
    if (field.type === "checkbox") {
      const el = container.querySelector(`input[name="${name}"]`);
      return el && el.checked ? "Yes" : "";
    }
    if (field.type === "file_upload" || field.type === "file") {
      // Value is stored in the hidden input after upload
      const el = container.querySelector(`input[type="hidden"][name="${name}"]`);
      return el ? el.value : "";
    }
    const el = container.querySelector(`[name="${name}"]`);
    return el ? el.value : "";
  };

  // ─── Validate all required fields ─────────────────────────────────────────
  const validateFields = () => {
    let valid = true;
    customFieldsData.forEach((field) => {
      if (!field.is_required) return;
      
      const wrapper = container.querySelector(`.flexi-field-wrapper[data-field-id="${field.id}"]`);
      // If the field is hidden by conditional logic, it's NOT required
      if (wrapper && wrapper.style.display === "none") return;

      const errorDiv = wrapper ? wrapper.querySelector(".flexi-field-error") : null;
      const val = getFieldValue(field);

      if (!val) {
        valid = false;
        wrapper?.classList.add("flexi-field-invalid");
        if (errorDiv) { 
          errorDiv.textContent = `${field.label} ${shopSettings.required_error_label}`; 
          errorDiv.style.display = "block"; 
        }
      } else {
        wrapper?.classList.remove("flexi-field-invalid");
        if (errorDiv) { errorDiv.textContent = ""; errorDiv.style.display = "none"; }
      }
    });
    return valid;
  };

  // ─── Build { labelKey: value } properties map ─────────────────────────────
  const getProperties = () => {
    const props = {};
    customFieldsData.forEach((field) => {
      const wrapper = container.querySelector(`.flexi-field-wrapper[data-field-id="${field.id}"]`);
      // Skip hidden fields for properties
      if (wrapper && wrapper.style.display === "none") return;

      const labelWithPrice = field.has_price_addon
        ? `${field.label} (+${field.price})`
        : field.label;
      const val = getFieldValue(field);
      if (val) props[labelWithPrice] = val;
    });
    return props;
  };

  // ─── Sum price addons for filled fields ───────────────────────────────────
  const calculateTotalAddon = () => {
    let total = 0;
    customFieldsData.forEach((field) => {
      const wrapper = container.querySelector(`.flexi-field-wrapper[data-field-id="${field.id}"]`);
      // Only count visible fields towards price
      if (wrapper && wrapper.style.display !== "none" && field.has_price_addon && field.price) {
        const val = getFieldValue(field);
        if (val && val.trim() !== "") {
          const p = parseFloat(field.price);
          if (!isNaN(p)) total += p;
        }
      }
    });
    console.log("Flexi Fields: Calculated total addon price:", total);
    return total;
  };

  // ─── Cart Sync Engine (Cart Page Logic) ──────────────────────────────────
  const syncCartAddons = async () => {
    try {
      const res = await originalFetch("/cart.js");
      const cart = await res.json();
      
      let expectedAddonQty = 0;
      let addonItemKey = null;
      let currentAddonQty = 0;

      cart.items.forEach(item => {
        // Calculate expected from properties
        if (item.properties) {
          Object.keys(item.properties).forEach(key => {
            const match = key.match(/\(\+([0-9.]+)\)/);
            if (match) {
              const price = parseFloat(match[1]);
              expectedAddonQty += Math.round(price) * item.quantity;
            }
          });
        }

        // Identify current addon item
        const addonTitle = shopSettings.addon_product_name;
        if (item.title === addonTitle || (item.handle && item.handle.includes('flexi-fields-addon'))) {
          addonItemKey = item.key;
          currentAddonQty = item.quantity;
        }
      });

      // If mismatch, fix it
      if (expectedAddonQty !== currentAddonQty) {
        console.log(`Flexi Fields: Syncing cart addon. Expected: ${expectedAddonQty}, Current: ${currentAddonQty}`);
        if (expectedAddonQty > 0) {
           // We use /cart/update.js to set the specific quantity
           const updates = {};
           if (addonItemKey) {
             updates[addonItemKey] = expectedAddonQty;
           } else if (addonVariantId) {
             updates[addonVariantId] = expectedAddonQty;
           }
           
           if (Object.keys(updates).length > 0) {
             await originalFetch("/cart/update.js", {
               method: "POST",
               headers: { "Content-Type": "application/json" },
               body: JSON.stringify({ updates })
             });
             // Refresh page if on cart page to show updated total
             if (window.location.pathname.includes("/cart")) window.location.reload();
           }
        } else if (currentAddonQty > 0 && addonItemKey) {
           // Remove it if no items need it
           await originalFetch("/cart/change.js", {
             method: "POST",
             headers: { "Content-Type": "application/json" },
             body: JSON.stringify({ id: addonItemKey, quantity: 0 })
           });
           if (window.location.pathname.includes("/cart")) window.location.reload();
        }
      }
    } catch (e) {
      console.error("Flexi Fields: Cart sync failed", e);
    }
  };

  const hideAddonControls = () => {
    const styleId = "flexi-addon-hide-style";
    if (document.getElementById(styleId)) return;
    
    const style = document.createElement("style");
    style.id = styleId;
    const addonTitle = shopSettings.addon_product_name;
    style.innerHTML = `
      /* Hide remove buttons and quantity selectors for the addon item in the cart */
      [data-cart-item-title*="${addonTitle}"], 
      .cart-item[data-product-title*="${addonTitle}"],
      .cart__item[data-product-title*="${addonTitle}"],
      tr[data-cart-item-id*="addon"] {
        pointer-events: none;
      }
      [data-cart-item-title*="${addonTitle}"] .cart-item__remove,
      [data-cart-item-title*="${addonTitle}"] .quantity-selector,
      .cart-item[data-product-title*="${addonTitle}"] .cart-item__remove,
      .cart-item[data-product-title*="${addonTitle}"] .quantity,
      .cart__item[data-product-title*="${addonTitle}"] .cart__remove,
      .cart__item[data-product-title*="${addonTitle}"] .cart__quantity {
        display: none !important;
        visibility: hidden !important;
      }
    `;
    document.head.appendChild(style);
  };

  // ─── Price Summary Update ────────────────────────────────────────────────
  const updateSummary = () => {
    if (typeof calculateTotalAddon !== "function") return;
    const total = calculateTotalAddon();
    const summary = container.querySelector(".flexi-price-summary");
    if (!summary) return;

    if (total > 0) {
      const lines = customFieldsData
        .filter((f) => {
          const wrapper = container.querySelector(`.flexi-field-wrapper[data-field-id="${f.id}"]`);
          return wrapper && wrapper.style.display !== "none" && f.has_price_addon && f.price && getFieldValue(f);
        })
        .map((f) => `${f.label}: +$${parseFloat(f.price).toFixed(2)}`)
        .join(" | ");
      summary.innerHTML = `<strong>${shopSettings.summary_label}: +$${total.toFixed(2)}</strong>&nbsp;&nbsp;<span style="opacity:0.75;font-size:0.85em">(${lines})</span>`;
      summary.style.display = "block";
    } else {
      summary.innerHTML = "";
      summary.style.display = "none";
    }
  };
  window.updateSummary = updateSummary;

  // ─── Scroll to first validation error ────────────────────────────────────
  const scrollToFirstError = () => {
    const el = container.querySelector('.flexi-field-error[style*="block"]');
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  // ─── Conditional Logic Engine ─────────────────────────────────────────────
  const evaluateConditions = () => {
    customFieldsData.forEach((field) => {
      const wrapper = container.querySelector(`.flexi-field-wrapper[data-field-id="${field.id}"]`);
      if (!wrapper) return;

      if (!field.conditions || field.conditions.length === 0) {
        wrapper.style.display = "flex";
        return;
      }

      const results = field.conditions.map((cond) => {
        const otherField = customFieldsData.find((f) => String(f.id) === String(cond.field_id));
        if (!otherField) return true;

        const val = getFieldValue(otherField);
        const targetVal = cond.value;

        switch (cond.operator) {
          case "equals": return String(val) === String(targetVal);
          case "not_equals": return String(val) !== String(targetVal);
          case "contains": return String(val).includes(String(targetVal));
          case "not_contains": return !String(val).includes(String(targetVal));
          case "is_empty": return !val || val.trim() === "";
          case "is_not_empty": return val && val.trim() !== "";
          default: return true;
        }
      });

      const isVisible = field.logic_type === "any" 
        ? results.some(r => r) 
        : results.every(r => r);

      wrapper.style.display = isVisible ? "flex" : "none";
      
      // Disable inputs if hidden so they are not submitted with the form
      const inputs = wrapper.querySelectorAll("input, select, textarea");
      inputs.forEach(input => {
        input.disabled = !isVisible;
      });
    });
    
    // Refresh price summary since hidden fields shouldn't add to price
    updateSummary();
  };

  // ─── Inject properties into a JSON cart body string ──────────────────────
  // Addon variant quantity = totalAddonPrice dollars (addon product price = $1)
  const injectJsonBody = (body, properties, totalAddonPrice) => {
    const parsed = typeof body === "string" ? JSON.parse(body) : body;

    if (totalAddonPrice > 0) {
      if (!addonVariantId) {
        alert("Flexi Fields Error: Price addons were selected, but the 'Addon Variant ID' is not configured. Please go to the Flexi Fields app dashboard, copy the 'Addon Variant ID' from the Pricing Configuration section, and paste it into the Theme Editor.");
      } else {
        // Flatten to items[] format so we can append the addon
      let mainItem;
      if (parsed.items && parsed.items.length > 0) {
        mainItem = parsed.items[0];
      } else {
        mainItem = { id: parsed.id, quantity: parsed.quantity || 1, properties: parsed.properties || {} };
      }
      mainItem.properties = { ...(mainItem.properties || {}), ...properties };

      const cleanAddonId = parseInt(String(addonVariantId).replace(/\D/g, ""));
      const addonItem = {
        id: cleanAddonId,
        quantity: Math.round(totalAddonPrice), // addon variant = $1 each
        properties: { _parent_item: String(productId), _flexi_addon: "true" },
      };
      return JSON.stringify({ items: [mainItem, addonItem] });
      }
    }

    // No addon — just append/replace properties
    if (parsed.items) {
      parsed.items.forEach((item) => {
        const existingProps = item.properties || {};
        // Clear all existing properties that might be ours
        const newProps = {};
        Object.keys(existingProps).forEach(k => {
            // Keep properties that don't look like ours (e.g. starting with underscore like _selling_plan)
            // or if they are explicitly in our current properties set
            if (k.startsWith("_") || properties.hasOwnProperty(k)) {
                newProps[k] = properties.hasOwnProperty(k) ? properties[k] : existingProps[k];
            }
        });
        // Add any new properties that weren't in existingProps
        Object.assign(newProps, properties);
        item.properties = newProps;
      });
    } else {
      const existingProps = parsed.properties || {};
      const newProps = {};
      Object.keys(existingProps).forEach(k => {
          if (k.startsWith("_") || properties.hasOwnProperty(k)) {
              newProps[k] = properties.hasOwnProperty(k) ? properties[k] : existingProps[k];
          }
      });
      Object.assign(newProps, properties);
      parsed.properties = newProps;
    }
    return JSON.stringify(parsed);
  };

  // ─── Inject properties into a FormData object (mutates in place) ──────────
  const injectFormData = (formData, properties) => {
    // 1. Clear any existing properties to avoid stale data
    const keys = [];
    for (const key of formData.keys()) {
      if (key.startsWith("properties[")) keys.push(key);
    }
    keys.forEach(k => formData.delete(k));

    // 2. Inject only active properties
    Object.entries(properties).forEach(([key, value]) => {
      if (value) formData.set(`properties[${key}]`, value);
    });
  };

  // ─── Add the price addon to cart via a separate request ───────────────────
  // The addon variant must be priced at exactly $1.00.
  // quantity = totalAddonPrice (e.g. $15 = 15 units × $1)
  const addAddonToCart = async (totalAddonPrice) => {
    if (totalAddonPrice <= 0) return;
    const cleanAddonId = addonVariantId ? String(addonVariantId).replace(/\D/g, "") : null;
    
    if (!cleanAddonId) {
      alert("Flexi Fields Error: The 'Addon Variant ID' is missing. Please go to the Flexi Fields app dashboard, copy the 'Addon Variant ID' from the Pricing Configuration section, and paste it into the Theme Editor.");
      console.error(
        "Flexi Fields: Cannot add price addon — Addon Variant ID is not configured. " +
        "Set it in the theme block settings (Addon Variant ID field)."
      );
      return;
    }
    console.log(`Flexi Fields: Adding price addon — $${totalAddonPrice.toFixed(2)} (variant ${cleanAddonId} × ${Math.round(totalAddonPrice)} qty)`);
    try {
      const res = await originalFetch("/cart/add.js", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [{
            id: parseInt(cleanAddonId),
            quantity: Math.round(totalAddonPrice),
            properties: { _parent_item: String(productId), _flexi_addon: "true" },
          }],
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const msg = err.description || err.message || res.statusText;
        alert(`Flexi Fields Error: Failed to add price addon to cart. Shopify responded: "${msg}".\n\nPlease ensure your Addon Product is:\n1. Published to the Online Store\n2. In Stock (or 'Continue selling when out of stock' is checked)\n3. Set to $1.00`);
        console.error("Flexi Fields: Addon cart add failed:", res.status, err);
      }
    } catch (e) {
      console.error("Flexi Fields: Failed to add price addon:", e);
    }
  };

  // Helper to handle loading state on the submit button
  const setSubmitLoading = (loading) => {
    const form = document.querySelector('form[action*="/cart/add"]');
    if (!form) return;
    const btn = form.querySelector('[name="add"], button[type="submit"]');
    if (!btn) return;

    if (loading) {
      btn.disabled = true;
      btn.dataset.originalText = btn.innerHTML;
      btn.innerHTML = 'Adding...';
      btn.style.opacity = '0.5';
    } else {
      btn.disabled = false;
      if (btn.dataset.originalText) btn.innerHTML = btn.dataset.originalText;
      btn.style.opacity = '1';
    }
  };

  // ─── Set up fetch + XHR + form-submit intercepts ─────────────────────────
  const setupIntercepts = () => {

    // ── 1. fetch intercept ────────────────────────────────────────────────
    window.fetch = async (...args) => {
      const [resource, config] = args;
      const reqUrl = typeof resource === "string" ? resource : (resource?.url ?? "");

      if (reqUrl.includes("/cart/add")) {
        if (config && config.body) {
          // Skip if this is our own addon request to prevent infinite loop
          const bodyStr = config.body instanceof FormData ? "" : (typeof config.body === "string" ? config.body : "");
          if (bodyStr.includes("_flexi_addon") || (config.body instanceof FormData && config.body.has("properties[_flexi_addon]"))) {
             return originalFetch(...args);
          }

          if (!validateFields()) {
            scrollToFirstError();
            return new Response(JSON.stringify({ errors: "Validation failed" }), { status: 422 });
          }

          setSubmitLoading(true);
          const properties = getProperties();
          const totalAddonPrice = calculateTotalAddon();
          
          try {
            if (config.body instanceof FormData) {
              injectFormData(config.body, properties);
            } else {
              config.body = injectJsonBody(config.body, properties, totalAddonPrice);
            }
            
            if (totalAddonPrice > 0 && addonVariantId) {
              await addAddonToCart(totalAddonPrice);
            }
          } catch (e) {
            console.error("Flexi Fields: Failed to modify fetch body:", e);
          } finally {
            // Give it a moment before enabling the button again
            setTimeout(() => setSubmitLoading(false), 1500);
          }
          return originalFetch(...args);
        }
      }

      const response = await originalFetch(...args);
      
      // Trigger cart sync after any cart modification
      if (reqUrl.includes("/cart/add") || reqUrl.includes("/cart/change") || reqUrl.includes("/cart/update") || reqUrl.includes("/cart/clear")) {
        setTimeout(syncCartAddons, 500);
      }

      return response;
    };

    // ── 2. XMLHttpRequest intercept ───────────────────────────────────────
    function FlexiXHR() {
      const xhr = new OriginalXHR();
      let reqUrl = "";

      const originalOpen = xhr.open.bind(xhr);
      xhr.open = function (method, url, ...rest) {
        reqUrl = url;
        return originalOpen(method, url, ...rest);
      };

      const originalSend = xhr.send.bind(xhr);
      xhr.send = function (body) {
        if (reqUrl.includes("/cart/add")) {
          if (body) {
            // Skip if this is our own addon request
            const bodyStr = body instanceof FormData ? "" : (typeof body === "string" ? body : "");
            if (bodyStr.includes("_flexi_addon") || (body instanceof FormData && body.has("properties[_flexi_addon]"))) {
              return originalSend(body);
            }

            if (!validateFields()) {
              scrollToFirstError();
              return;
            }

            const properties = getProperties();
            const totalAddonPrice = calculateTotalAddon();

            try {
              if (body instanceof FormData) {
                injectFormData(body, properties);
                if (totalAddonPrice > 0 && addonVariantId) {
                  addAddonToCart(totalAddonPrice);
                }
              } else if (typeof body === "string") {
                body = injectJsonBody(body, properties, totalAddonPrice);
              }
            } catch (e) {
              console.error("Flexi Fields: Failed to modify XHR body:", e);
            }
          }
        }
        return originalSend(body);
      };

      return xhr;
    }
    FlexiXHR.prototype = OriginalXHR.prototype;
    window.XMLHttpRequest = FlexiXHR;

    // ── 3. Native form submit fallback ────────────────────────────────────
    const form = document.querySelector('form[action*="/cart/add"]');
    if (form) {
      form.addEventListener("submit", (e) => {
        if (!validateFields()) {
          e.preventDefault();
          e.stopImmediatePropagation();
          scrollToFirstError();
        }
      }, true);
      
      form.addEventListener("submit", async (e) => {
        if (e.defaultPrevented) return;
        
        const totalAddonPrice = calculateTotalAddon();
        if (totalAddonPrice > 0 && addonVariantId) {
          e.preventDefault();
          setSubmitLoading(true);
          
          await addAddonToCart(totalAddonPrice);
          
          const formData = new FormData(form);
          injectFormData(formData, getProperties());
          try {
            await originalFetch("/cart/add.js", {
              method: "POST",
              body: formData,
              headers: { "Accept": "application/json" }
            });
          } finally {
            window.location.href = "/cart";
          }
        }
      });
    }
  };

  // ─── Render all field elements ────────────────────────────────────────────
  const renderFields = (fields) => {
    container.innerHTML = "";
    fields.forEach((field) => {
      const wrapper = document.createElement("div");
      wrapper.className = `flexi-field-wrapper custom-field flexi-field-${field.id}`;
      wrapper.id = `flexi-field-${field.id}`;
      wrapper.setAttribute("data-field-id", field.id);

      const labelText =
        field.label +
        (field.has_price_addon ? ` (+$${parseFloat(field.price).toFixed(2)})` : "") +
        (field.is_required ? " *" : "");
      const label = document.createElement("label");
      label.className = "flexi-field-label";
      label.textContent = labelText;
      wrapper.appendChild(label);

      const labelWithPrice = field.has_price_addon
        ? `${field.label} (+${field.price})`
        : field.label;
      const propertyName = `properties[${labelWithPrice}]`;

      switch (field.type) {
        case "text":
        case "email":
        case "number": {
          const input = document.createElement("input");
          input.type = field.type;
          input.className = "flexi-field-input";
          input.placeholder = field.placeholder || "";
          input.name = propertyName;
          wrapper.appendChild(input);
          break;
        }

        case "textarea": {
          const input = document.createElement("textarea");
          input.className = "flexi-field-input";
          input.placeholder = field.placeholder || "";
          input.name = propertyName;
          wrapper.appendChild(input);
          break;
        }

        case "select": {
          const input = document.createElement("select");
          input.className = "flexi-field-input";
          input.name = propertyName;
          if (!field.is_required) {
            const empty = document.createElement("option");
            empty.value = "";
            empty.textContent = "Select an option";
            input.appendChild(empty);
          }
          (field.options || []).forEach((opt) => {
            const option = document.createElement("option");
            const v = typeof opt === "object" && opt ? opt.value || opt.label : opt;
            const l = typeof opt === "object" && opt ? opt.label || opt.value : opt;
            option.value = v;
            option.textContent = l;
            input.appendChild(option);
          });
          wrapper.appendChild(input);
          break;
        }

        case "file_upload":
        case "file": {
          const dropzone = document.createElement("div");
          dropzone.className = "flexi-field-file-dropzone";
          dropzone.innerHTML = `
            <div class="upload-icon">+</div>
            <div class="upload-text">Upload your file here</div>
          `;

          const fileInput = document.createElement("input");
          fileInput.type = "file";
          fileInput.className = "flexi-field-input"; // Hidden via CSS
          fileInput.style.display = "none";

          // Hidden input carries the uploaded URL as a line-item property
          const hiddenInput = document.createElement("input");
          hiddenInput.type = "hidden";
          hiddenInput.name = propertyName;

          const status = document.createElement("p");
          status.className = "flexi-field-help";
          status.style.fontSize = "0.85em";

          dropzone.addEventListener("click", () => fileInput.click());

          fileInput.addEventListener("change", async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            isUploading = true;
            dropzone.classList.add("uploading");
            const uploadText = dropzone.querySelector(".upload-text");
            const originalText = uploadText.textContent;
            uploadText.textContent = "Uploading…";
            
            const fd = new FormData();
            fd.append("file", file);
            fd.append("shop", shop);
            try {
              const res = await fetch(`${baseApiUrl}/upload-file`, {
                method: "POST",
                body: fd,
                headers: { "ngrok-skip-browser-warning": "true", Accept: "application/json" },
              });
              const json = await res.json();
              if (json.url) {
                hiddenInput.value = json.url;
                uploadText.textContent = "✓ Uploaded";
                uploadText.style.color = "green";
                wrapper.classList.remove("flexi-field-invalid");
                const err = wrapper.querySelector(".flexi-field-error");
                if (err) err.style.display = "none";
                
                // Trigger change event to update the live price summary
                hiddenInput.dispatchEvent(new Event("change", { bubbles: true }));
              } else {
                throw new Error("No URL returned");
              }
            } catch (err) {
              console.error("Flexi Fields: upload error:", err);
              status.textContent = "Upload failed. Please try again.";
              status.style.color = "red";
            } finally {
              isUploading = false;
            }
          });

          wrapper.appendChild(dropzone);
          wrapper.appendChild(fileInput);
          wrapper.appendChild(hiddenInput);
          wrapper.appendChild(status);
          break;
        }

        case "checkbox": {
          const cbLabel = document.createElement("label");
          cbLabel.className = "flexi-field-checkbox-wrapper";
          const cb = document.createElement("input");
          cb.type = "checkbox";
          cb.value = "Yes";
          cb.className = "flexi-field-checkbox";
          cb.name = propertyName;
          const cbSpan = document.createElement("span");
          cbSpan.textContent = " " + (field.label || "");
          cbLabel.appendChild(cb);
          cbLabel.appendChild(cbSpan);
          wrapper.appendChild(cbLabel);
          break;
        }

        case "radio": {
          (field.options || []).forEach((opt) => {
            const row = document.createElement("div");
            const radio = document.createElement("input");
            radio.type = "radio";
            radio.name = propertyName;
            const v = typeof opt === "object" && opt ? opt.value || opt.label : opt;
            const l = typeof opt === "object" && opt ? opt.label || opt.value : opt;
            radio.value = v;
            const span = document.createElement("span");
            span.textContent = " " + l;
            row.appendChild(radio);
            row.appendChild(span);
            wrapper.appendChild(row);
          });
          break;
        }
      }

      const errorDiv = document.createElement("div");
      errorDiv.className = "flexi-field-error";
      errorDiv.style.cssText = "display:none;color:red;font-size:0.875rem;margin-top:0.4rem;";
      wrapper.appendChild(errorDiv);

      if (field.help_text) {
        const help = document.createElement("p");
        help.className = "flexi-field-help";
        help.textContent = field.help_text;
        wrapper.appendChild(help);
      }

      // Inject Custom CSS if present (Automatically scoped to this field)
      if (field.settings && field.settings.custom_css) {
        const style = document.createElement("style");
        style.textContent = `#flexi-field-${field.id} { ${field.settings.custom_css} }`;
        wrapper.appendChild(style);
      }

      container.appendChild(wrapper);
    });

    // Initial evaluation of conditions
    evaluateConditions();
  };

  // ─── Live price summary bar ───────────────────────────────────────────────
  const setupPriceSummary = () => {
    const hasAnyPriceAddon = customFieldsData.some((f) => f.has_price_addon && f.price);
    if (!hasAnyPriceAddon) return;

    // Create summary element
    const summary = document.createElement("div");
    summary.className = "flexi-price-summary";
    summary.style.cssText = [
      "display:none",
      "margin-top:12px",
      "padding:10px 14px",
      "border-radius:6px",
      "background:#f0f9f0",
      "border:1px solid #b2dfb2",
      "font-size:0.95rem",
      "color:#1a5c1a",
    ].join(";");
    container.appendChild(summary);

    const updateSummaryInternal = () => {
      evaluateConditions();
      updateSummary();
    };

    // Listen to any input/change inside the container
    container.addEventListener("input", updateSummaryInternal);
    container.addEventListener("change", updateSummaryInternal);
  };

  window.updateSummary = null; // Will be set in setupPriceSummary

  // ─── Initialize ──────────────────────────────────────────────────────────
  fetchFields();
  setupIntercepts();
  
  // Start cart sync immediately and on cart-relevant pages
  if (window.location.pathname.includes("/cart") || document.querySelector('[class*="cart"], [id*="cart"]')) {
    hideAddonControls();
    syncCartAddons();
  }
});
