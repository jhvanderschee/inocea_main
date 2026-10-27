// Meerkeuzeveld: op een muis-apparaat checkboxjes, op touch de native select; de +/- schakelt handmatig.
function setupMultiselect() {
    const
        coarse = window.matchMedia("(pointer: coarse)"),
        debug = new URLSearchParams(window.location.search).get("debug") === "1";

    document.querySelectorAll("select[multiple]").forEach(select => {
        const
            fieldset = document.createElement("fieldset"),
            toggle = document.createElement("button"),
            label = document.querySelector(`label[for="${select.id}"]`),
            required = select.required,
            options = [...select.options],
            checkboxes = options.map(option => {
                const
                    item = document.createElement("label"),
                    checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.value = option.value;
                item.append(checkbox, option.textContent);
                fieldset.append(item);
                return checkbox;
            }),
            expanded = () => override === null ? !coarse.matches : override,
            updateHint = () => select.classList.toggle("empty", !select.selectedOptions.length),
            // Het verplicht-zijn zit op het zichtbare veld, zodat de browser zijn eigen melding daar toont.
            syncValidation = () => {
                select.required = required && !expanded();
                if (checkboxes[0]) checkboxes[0].required = required && expanded() && !checkboxes.some(checkbox => checkbox.checked);
            },
            applyLayout = () => {
                if (expanded()) {
                    checkboxes.forEach((checkbox, i) => checkbox.checked = options[i].selected);
                    select.style.display = "none";
                    fieldset.style.display = "";
                    toggle.textContent = "−";
                    toggle.style.display = debug ? "" : "none";
                    toggle.setAttribute("aria-expanded", "true");
                } else {
                    select.style.display = "";
                    select.setAttribute("size", "1");
                    fieldset.style.display = "none";
                    toggle.textContent = "+";
                    toggle.setAttribute("aria-expanded", "false");
                }
                syncValidation();
            };
        let override = null;

        fieldset.style.maxHeight = "235px";
        fieldset.style.overflowY = "auto";
        fieldset.setAttribute("data-lenis-prevent", "");
        toggle.type = "button";
        toggle.className = "multiselect-toggle";
        select.after(fieldset);
        if (label) label.append(" ", toggle);
        else select.before(toggle);

        select.addEventListener("change", updateHint);
        fieldset.addEventListener("change", () => {
            checkboxes.forEach((checkbox, i) => options[i].selected = checkbox.checked);
            syncValidation();
            updateHint();
        });
        toggle.addEventListener("click", () => {
            override = !expanded();
            applyLayout();
        });
        coarse.addEventListener("change", () => { if (override === null) applyLayout(); });
        applyLayout();
        updateHint();
    });
}
setupMultiselect();
