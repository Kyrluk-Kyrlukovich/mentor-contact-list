import "./style/index.scss";
import { IContactItem, IContactListHtml, IListContacts } from "./types";

const modal = {
    open(id: string) {
        const modal = document.getElementById(id);
        if (!modal.classList.contains("active")) {
            modal?.classList.add("active");
        }
    },

    close(id: string) {
        const modal = document.getElementById(id);

        modal?.classList.remove("active");
    },
};

const initModals = () => {
    document.addEventListener("click", (evt) => {
        if (evt.target instanceof Element) {
            if (evt.target.matches("[data-modal]")) {
                modal.open(evt.target.getAttribute("data-modal"));
            }

            if (evt.target.matches(".js-modal-close")) {
                const modalWrapper = evt.target.closest(".modal");
                modal.close(modalWrapper.getAttribute("id"));
            }
        }
    });
};

const dropdown = (item: HTMLElement) => {
    item.addEventListener("click", (evt) => {
        if (evt.target instanceof Element) {
            const dropdown = evt.target.closest(".js-dropdown");
            if (evt.target.closest(".js-dropdown-head")) {
                dropdown?.classList.toggle("active");
            }
        }
    });
};

const initDropdowns = () => {
    const listDropdowns = document.querySelectorAll(".js-dropdown");
    listDropdowns.forEach(dropdown);
};

const listContacts: IListContacts = {
    items: localStorage.getItem("items")
        ? JSON.parse(localStorage.getItem("items"))
        : [],

    saveItems() {
        localStorage.setItem("items", JSON.stringify(this.items));
    },
    add(item) {
        this.items.push(item);
        this.saveItems();
    },

    remove(name) {
        this.items = this.items.filter((el: IContactItem) => el.name !== name);
        this.saveItems();
    },

    updateElem(name, newValue) {
        this.items = this.items.map((el: IContactItem) => {
            if (el.name === name) {
                return { ...newValue };
            }

            return el;
        });
        this.saveItems();
    },

    clearList() {
        this.items = [];
        localStorage.removeItem("items");
    },

    getElemByName(name) {
        return this.items.find(
            (item: IContactItem) =>
                item.name.toLowerCase() === name.toLowerCase()
        );
    },

    search(str) {
        return this.items.filter((item: IContactItem) =>
            item.name.toLowerCase().includes(str.toLowerCase())
        );
    },
};

const contactListHtml: IContactListHtml = {
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
            this.contactListHtml.forEach((elem: HTMLElement) => {
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
            if (evt.target instanceof Element) {
                if (evt.target.matches("[data-item-delete]")) {
                    listContacts.remove(
                        evt.target.getAttribute("data-item-delete")
                    );
                    contactListHtml.drawContactList();
                }
            }
        });
    }
};

const validateEmptyField = (field: HTMLInputElement) => {
    let isValidField = true;
    if (!field) isValidField = false;
    const value = field.value.trim();
    if (value === null || value === undefined || value.trim() === "")
        isValidField = false;

    return isValidField;
};

const customValidateOnlyLetters = (field: HTMLInputElement) => {
    let isValidField = true;
    if (!field) isValidField = false;
    const value = field.value.trim();
    if (value) isValidField = !/\d/.test(value);

    return isValidField;
};

const customValidateOnlyLatin = (field: HTMLInputElement) => {
    let isValidField = true;
    if (!field) isValidField = false;
    const value = field.value.trim();
    if (value) isValidField = /^[a-zA-Z\s]+$/.test(value);

    return isValidField;
};

const validateUniqueName = (field: HTMLInputElement, list: IContactItem[]) => {
    if (!field) return false;
    return list.every((item) => item.name !== field.value);
};

const customValidatePhoneNumber = (field: HTMLInputElement) => {
    let isValidField = true;
    if (!field) isValidField = false;
    const value = field.value.trim();
    if (value) isValidField = /^\+7 \d{3} \d{3} \d{2} \d{2}/.test(value);

    return isValidField;
};

const resetErrorField = (field: HTMLDivElement) => {
    if (field) {
        field.classList.remove("error");
        const errorBlock = field.querySelector(".js-input-error");
        if (errorBlock) errorBlock.textContent = "";
    }
};

const showErrorField = (field: HTMLDivElement, message: string) => {
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

const initForm = (form: HTMLElement) => {
    form.addEventListener("input", (event) => {
        if (event.target instanceof Element) {
            const field = event.target.closest(".input.error");
            if (field && field instanceof HTMLDivElement) {
                resetErrorField(field);
            }
        }
    });
    const fields = form.querySelectorAll(".input");

    const resetErrorForm = () => {
        fields.forEach((field) => {
            if (field instanceof HTMLDivElement) {
                resetErrorField(field);
            }
        });
    };

    const validate = () => {
        let isValid = true;
        fields.forEach((field) => {
            const input = field.querySelector("input");
            const inputRules = input.getAttribute("data-rules").split(" ");
            if (inputRules.includes("required") && !validateEmptyField(input)) {
                if (field instanceof HTMLDivElement)
                    showErrorField(field, "Field is required");
                isValid = false;
            }

            if (
                inputRules.includes("only-letters") &&
                !customValidateOnlyLetters(input)
            ) {
                if (field instanceof HTMLDivElement)
                    showErrorField(field, "Field should contain only letters");
                isValid = false;
            }

            if (
                inputRules.includes("only-latin") &&
                !customValidateOnlyLatin(input)
            ) {
                if (field instanceof HTMLDivElement)
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
                if (field instanceof HTMLDivElement)
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

const isValidFieldsContactForm = (form: HTMLElement) => {
    const { validate } = initForm(form);
    const name = form.querySelector('input[name="name"]');

    let isValid = validate();
    if (name instanceof HTMLInputElement) {
        if (!validateUniqueName(name, listContacts.items)) {
            showErrorField(name.closest(".input"), "Name should be unique");
            isValid = false;
        }
    } else {
        isValid = false;
    }

    return isValid;
};

const contactForm = () => {
    const form = document.querySelector(".js-form-contact");
    const btnAdd = document.querySelector(".js-btn-contact-add");
    const btnClearList = document.querySelector(".js-btn-clear-list");

    btnAdd.addEventListener("click", () => {
        if (form instanceof HTMLElement && isValidFieldsContactForm(form)) {
            const name = form.querySelector('input[name="name"]');
            const vacancy = form.querySelector('input[name="vacancy"]');
            const phone = form.querySelector('input[name="phone"]');

            if (
                name instanceof HTMLInputElement &&
                vacancy instanceof HTMLInputElement &&
                phone instanceof HTMLInputElement
            ) {
                listContacts.add({
                    name: name.value,
                    vacancy: vacancy.value,
                    phone: phone.value,
                });
            }

            contactListHtml.drawContactList();
        }
    });

    btnClearList.addEventListener("click", () => {
        listContacts.clearList();
        contactListHtml.drawContactList();
    });
};

const updateSearchList = (items: IContactItem[]) => {
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
        if (evt.target instanceof Element) {
            if (evt.target.matches("[data-item-edit]")) {
                const modalWrapper =
                    document.getElementById("edit-contact-modal");
                const nameField =
                    modalWrapper.querySelector('input[name="name"]');
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

                if (
                    nameField instanceof HTMLInputElement &&
                    vacancyField instanceof HTMLInputElement &&
                    phoneField instanceof HTMLInputElement
                ) {
                    nameField.value = name;
                    vacancyField.value = vacancy;
                    phoneField.value = phone;
                }

                btnSave.setAttribute("data-save-item", name);
                modal.open("edit-contact-modal");
            }

            if (evt.target.matches("[data-item-delete]")) {
                listContacts.remove(
                    evt.target.getAttribute("data-item-delete")
                );

                const input = document.querySelector(".js-input-search");
                if (input instanceof HTMLInputElement)
                    updateSearchList(listContacts.search(input.value));
                contactListHtml.drawContactList();
            }
        }
    });
};

const initSearchByName = () => {
    const input = document.querySelector(".js-input-search");

    input.addEventListener("input", () => {
        if (input instanceof HTMLInputElement)
            updateSearchList(listContacts.search(input.value));
    });
};

const isValidSaveEditForm = (form: HTMLElement, oldName: string) => {
    const { validate } = initForm(form);
    const nameField = form.querySelector('input[name="name"]');

    let isValid = validate();

    return (
        isValid &&
        listContacts.items.every((item) => {
            if (nameField instanceof HTMLInputElement) {
                return item.name === oldName || item.name !== nameField.value;
            }
            return false;
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
        if (evt.target instanceof Element) {
            const oldName = btnSave.getAttribute("data-save-item");
            const form = document.querySelector(".js-form-contact-edit");

            if (
                oldName &&
                form instanceof HTMLElement &&
                nameField instanceof HTMLInputElement &&
                vacancyField instanceof HTMLInputElement &&
                phoneField instanceof HTMLInputElement &&
                isValidSaveEditForm(form, oldName)
            ) {
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

                if (input instanceof HTMLInputElement)
                    updateSearchList(listContacts.search(input.value));

                contactListHtml.drawContactList();
                modal.close("edit-contact-modal");
            }
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

    alert('proverka ci/cd')
});
