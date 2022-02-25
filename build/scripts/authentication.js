var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { getToken, setToken } from "../modules/token_management.js";
import { authenticationServerUrl, galleryUrl, currentUrl } from "../modules/environment_variables.js";
import { removeEventListeners } from "../modules/event_listeners_management.js";
const loginForm = document.forms.namedItem("login");
const emailInput = loginForm.elements.namedItem("email");
const passwordInput = loginForm.elements.namedItem("password");
const submitButton = loginForm.elements.namedItem("submit");
const submitErrorContainer = loginForm.querySelector('.login-form__submit-error-message');
const currentPage = currentUrl.searchParams.get('currentPage');
const authenticationEventsArray = [
    { target: emailInput, type: 'input', handler: validateEmailInput }, { target: passwordInput, type: 'change', handler: validatePasswordInput }, { target: loginForm, type: 'submit', handler: submitForm }, { target: loginForm, type: 'focusin', handler: resetErrorMessage }
];
function validateField(field, pattern, text) {
    const targetErrorContainer = loginForm.querySelector(`.login-form__${field.name}-error-message`);
    targetErrorContainer.textContent = '';
    submitButton.disabled = false;
    submitButton.classList.remove('_disabled');
    field.classList.remove('invalid');
    if (field.value.length !== 0 && !pattern.test(field.value)) {
        showErrorMessage(text, targetErrorContainer, field);
    }
}
function showErrorMessage(text, targetElement, field) {
    targetElement.textContent = `${text}`;
    submitButton.disabled = true;
    submitButton.classList.add('_disabled');
    field.classList.add('invalid');
}
function sendFormData(url) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = {
            email: emailInput.value,
            password: passwordInput.value,
        };
        try {
            const response = yield fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
                body: JSON.stringify(user),
            });
            const data = yield response.json();
            if ('token' in data) {
                return data;
            }
            submitErrorContainer.textContent = `${data.errorMessage}`;
        }
        catch (err) {
            console.log(err);
        }
    });
}
function validateEmailInput() {
    const message = 'Wrong email format. Please, try again';
    const pattern = /[\w\d-_]+@([\w_-]+\.)+[\w]+/;
    validateField(emailInput, pattern, message);
}
function validatePasswordInput() {
    const message = 'Wrong password format. Please, try again';
    const pattern = /([a-zA-Z0-9]{8,})/;
    validateField(passwordInput, pattern, message);
}
function submitForm(e) {
    e.preventDefault();
    sendFormData(authenticationServerUrl)
        .then(data => {
        if (data) {
            setToken(data);
        }
    })
        .then(() => {
        if (getToken()) {
            removeEventListeners(authenticationEventsArray);
            if (!currentUrl.searchParams.get('currentPage')) {
                window.location.replace(`${galleryUrl}?page=1`);
            }
            else {
                window.location.replace(`${galleryUrl}?page=${currentPage}`);
            }
        }
    });
    emailInput.value = '';
    passwordInput.value = '';
}
function resetErrorMessage() {
    submitErrorContainer.textContent = '';
}
emailInput.addEventListener('input', validateEmailInput);
passwordInput.addEventListener('change', validatePasswordInput);
loginForm.addEventListener('submit', submitForm);
loginForm.addEventListener('focusin', resetErrorMessage);
