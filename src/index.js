import "./style/index.scss";

const modal = {
    open(id) {
        const modal = document.getElementById(id);
        if (modal && !modal.classList.contains("active")) {
            modal.classList.add("active");
        }
    },

    close(id) {
        const modal = document.getElementById(id);
        if (modal) {
            modal.classList.remove("active");
        }
    },
};

const initModals = () => {
    document.addEventListener("click", (evt) => {
        if (evt.target.matches("[data-modal]")) {
            modal.open(evt.target.getAttribute("data-modal"));
        }

        if (evt.target.matches(".js-modal-close")) {
            const modalWrapper = evt.target.closest(".modal");
            modal.close(modalWrapper.getAttribute("id"));
        }
    });
};

const dropdown = (item) => {
    item.addEventListener("click", (evt) => {
        if (
            evt.target.closest(".js-dropdown-head") &&
            evt.target.closest(".js-dropdown")
        ) {
            evt.target.closest(".js-dropdown").classList.toggle("active");
        }
    });
};

const initDropdowns = () => {
    const listDropdowns = document.querySelectorAll(".js-dropdown");
    listDropdowns.forEach(dropdown);
};

const listContacts = {
    items: localStorage.getItem("items")
        ? JSON.parse(localStorage.getItem("items"))
        : [],
    add(item) {
        this.items.push(item);
        localStorage.setItem("items", JSON.stringify(this.items));
    },

    remove(name) {
        this.items = this.items.filter((el) => el.name !== name);
        localStorage.setItem("items", JSON.stringify(this.items));
    },

    updateElem(name, newValue) {
        this.items = this.items.map((el) => {
            if (el.name === name) {
                return { ...newValue };
            }

            return el;
        });
        console.log(this.items);
        localStorage.setItem("items", JSON.stringify(this.items));
    },

    clearList() {
        this.items = [];
        localStorage.removeItem("items");
    },

    getElemByName(name) {
        return this.items.find(
            (item) => item.name.toLowerCase() === name.toLowerCase()
        );
    },

    search(str) {
        return this.items.filter((item) =>
            item.name.toLowerCase().includes(str.toLowerCase())
        );
    },
};

const contactListHtml = {
    contactListHMTL: null,
    getTemplate(item, withEdit = false) {
        const btnEdit = `<div class="contact-item__btn-edit" data-item-edit="${item.name}"></div>`;
        return `
            <div class="contact-item">
                ${withEdit ? btnEdit : ""}
                <div class="contact-item__btn-delete" data-item-delete="${
                    item.name
                }"></div>
                <div class="contact-item__field">
                    <span class="contact-item__field-label">Name:</span>
                    <span class="contact-item__field-value">${item.name}</span>
                </div>
                <div class="contact-item__field">
                    <span class="contact-item__field-label">Vacancy:</span>
                    <span class="contact-item__field-value">${
                        item.vacancy
                    }</span>
                </div>
                <div class="contact-item__field">
                    <span class="contact-item__field-label">Phone:</span>
                    <span class="contact-item__field-value">${item.phone}</span>
                </div>
            </div>`;
    },

    drawContactList() {
        if (!this.contactListHtml) {
            this.contactListHtml = document.querySelectorAll("[data-id]");
        }

        if (this.contactListHtml) {
            this.contactListHtml.forEach((elem) => {
                const id = elem.getAttribute("data-id");
                const body = elem.querySelector("[data-body]");
                const head = elem.querySelector("[data-head]");
                body.innerHTML = "";

                listContacts.items.forEach((item) => {
                    if (item.name.toLowerCase().startsWith(id)) {
                        body.insertAdjacentHTML(
                            "beforeend",
                            this.getTemplate(item)
                        );
                    }
                });

                if (body.children.length) {
                    head.textContent = `${id.toUpperCase()} (${
                        body.children.length
                    })`;
                } else {
                    head.textContent = id.toUpperCase();
                    body.textContent = "Здесь пока пусто...";
                }
            });
        }
    },
};

const initRemoveItemFromList = () => {
    const wrapperContacts = document.querySelector(".js-contact-table");
    if (wrapperContacts) {
        wrapperContacts.addEventListener("click", (evt) => {
            if (evt.target.matches("[data-item-delete]")) {
                listContacts.remove(
                    evt.target.getAttribute("data-item-delete")
                );
                contactListHtml.drawContactList();
            }
        });
    }
};

const validateEmptyField = (field) => {
    let isValidField = true;
    if (!field) isValidField = false;
    const value = field.value.trim();
    if (value === null || value === undefined || value.trim() === "")
        isValidField = false;

    return isValidField;
};

const customValidateOnlyLetters = (field) => {
    let isValidField = true;
    if (!field) isValidField = false;
    const value = field.value.trim();
    if (value) isValidField = !/\d/.test(value);

    return isValidField;
};

const customValidateOnlyLatin = (field) => {
    let isValidField = true;
    if (!field) isValidField = false;
    const value = field.value.trim();
    if (value) isValidField = /^[a-zA-Z\s]+$/.test(value);

    return isValidField;
};

const validateUniqueName = (field, list) => {
    if (!field) return false;
    return list.every((item) => item.name !== field.value);
};

const customValidatePhoneNumber = (field) => {
    let isValidField = true;
    if (!field) isValidField = false;
    const value = field.value.trim();
    if (value) isValidField = /^\+7 \d{3} \d{3} \d{2} \d{2}/.test(value);

    return isValidField;
};

const resetErrorField = (field) => {
    if (field) {
        field.classList.remove("error");
        const errorBlock = field.querySelector(".js-input-error");
        if (errorBlock) errorBlock.textContent = "";
    }
};

const showErrorField = (field, message) => {
    if (field && !field.classList.contains("error")) {
        const errorBlock = field.querySelector(".js-input-error");
        field.classList.add("error");
        if (errorBlock) errorBlock.textContent = message;

        field.addEventListener(
            "input",
            () => {
                resetErrorField(field);
            },
            { once: true }
        );
    }
};

const initForm = (form) => {
    form.addEventListener("input", (event) => {
        const field = event.target.closest(".input.error");
        if (field) {
            resetErrorField(field);
        }
    });
    const fields = form.querySelectorAll(".input");

    const resetErrorForm = () => {
        fields.forEach((field) => {
            resetErrorField(field);
        });
    };

    const validate = () => {
        let isValid = true;
        fields.forEach((field) => {
            const input = field.querySelector("input");
            const inputRules = input.getAttribute("data-rules").split(" ");
            if (inputRules.includes("required") && !validateEmptyField(input)) {
                showErrorField(field, "Field is required");
                isValid = false;
            }

            if (
                inputRules.includes("only-letters") &&
                !customValidateOnlyLetters(input)
            ) {
                showErrorField(field, "Field should contain only letters");
                isValid = false;
            }

            if (
                inputRules.includes("only-latin") &&
                !customValidateOnlyLatin(input)
            ) {
                showErrorField(
                    field,
                    "Field should contain only latin letters"
                );
                isValid = false;
            }

            if (
                inputRules.includes("phone") &&
                !customValidatePhoneNumber(input)
            ) {
                showErrorField(field, "Field should be +7 XXX XXX XX XX");
                isValid = false;
            }
        });

        return isValid;
    };

    return {
        validate,
        resetErrorForm,
    };
};

const isValidFieldsContactForm = (form) => {
    const { validate } = initForm(form);
    const name = form.querySelector('input[name="name"]');

    let isValid = validate();
    if (!validateUniqueName(name, listContacts.items)) {
        showErrorField(name.closest(".input"), "Name should be unique");
        isValid = false;
    }

    return isValid;
};

const contactForm = () => {
    const form = document.querySelector(".js-form-contact");
    const btnAdd = document.querySelector(".js-btn-contact-add");
    const btnClearList = document.querySelector(".js-btn-clear-list");

    btnAdd.addEventListener("click", () => {
        if (isValidFieldsContactForm(form)) {
            const name = form.querySelector('input[name="name"]');
            const vacancy = form.querySelector('input[name="vacancy"]');
            const phone = form.querySelector('input[name="phone"]');

            listContacts.add({
                name: name.value,
                vacancy: vacancy.value,
                phone: phone.value,
            });

            contactListHtml.drawContactList();
        }
    });

    btnClearList.addEventListener("click", () => {
        listContacts.clearList();
        contactListHtml.drawContactList();
    });
};

const updateSearchList = (items) => {
    const searchList = document.querySelector(".js-search-list");
    searchList.innerHTML = "";

    items.forEach((item) => {
        searchList.insertAdjacentHTML(
            "beforeend",
            contactListHtml.getTemplate(item, true)
        );
    });
};

const initSearchListActions = () => {
    const searchList = document.querySelector(".js-search-list");

    searchList.addEventListener("click", (evt) => {
        if (evt.target.matches("[data-item-edit]")) {
            const modalWrapper = document.getElementById("edit-contact-modal");
            const nameField = modalWrapper.querySelector('input[name="name"]');
            const vacancyField = modalWrapper.querySelector(
                'input[name="vacancy"]'
            );
            const phoneField = modalWrapper.querySelector(
                'input[name="phone"]'
            );
            const btnSave = modalWrapper.querySelector("[data-save-item]");

            const { name, vacancy, phone } = listContacts.getElemByName(
                evt.target.getAttribute("data-item-edit")
            );
            nameField.value = name;
            vacancyField.value = vacancy;
            phoneField.value = phone;
            btnSave.setAttribute("data-save-item", name);
            modal.open("edit-contact-modal");
        }

        if (evt.target.matches("[data-item-delete]")) {
            listContacts.remove(evt.target.getAttribute("data-item-delete"));

            const input = document.querySelector(".js-input-search");
            updateSearchList(listContacts.search(input.value));
            contactListHtml.drawContactList();
        }
    });
};

const initSearchByName = () => {
    const input = document.querySelector(".js-input-search");

    input.addEventListener("input", () => {
        updateSearchList(listContacts.search(input.value));
    });
};

const isValidSaveEditForm = (form, oldName) => {
    const { validate } = initForm(form);
    const nameField = form.querySelector('input[name="name"]');

    let isValid = validate();

    return (
        isValid &&
        listContacts.items.every((item) => {
            return item.name === oldName || item.name !== nameField.value;
        })
    );
};

const initSaveEditForm = () => {
    const modalWrapper = document.getElementById("edit-contact-modal");
    const nameField = modalWrapper.querySelector('input[name="name"]');
    const vacancyField = modalWrapper.querySelector('input[name="vacancy"]');
    const phoneField = modalWrapper.querySelector('input[name="phone"]');
    const btnSave = modalWrapper.querySelector("[data-save-item]");

    btnSave.addEventListener("click", (evt) => {
        const oldName = btnSave.getAttribute("data-save-item");
        const form = document.querySelector(".js-form-contact-edit");

        if (oldName && isValidSaveEditForm(form, oldName)) {
            const newItem = {
                name: nameField.value,
                vacancy: vacancyField.value,
                phone: phoneField.value,
            };
            const input = document.querySelector(".js-input-search");

            listContacts.updateElem(
                evt.target.getAttribute("data-save-item"),
                newItem
            );
            updateSearchList(listContacts.search(input.value));

            contactListHtml.drawContactList();
            modal.close("edit-contact-modal");
        }
    });
};

document.addEventListener("DOMContentLoaded", () => {
    initModals();
    initDropdowns();
    contactForm();
    initRemoveItemFromList();
    initSearchByName();
    initSearchListActions();
    initSaveEditForm();

    contactListHtml.drawContactList();
});
