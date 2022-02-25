import { getToken, setToken, Token, AuthenticationErrorMessage } from "../modules/token_management";
import { authenticationServerUrl, galleryUrl, currentUrl } from "../modules/environment_variables";
import { removeEventListeners, EventListener } from "../modules/event_listeners_management";

const loginForm = document.forms!.namedItem("login");
const emailInput = <HTMLInputElement>loginForm!.elements.namedItem("email");
const passwordInput = <HTMLInputElement>loginForm!.elements.namedItem("password");
const submitButton = <HTMLButtonElement>loginForm!.elements.namedItem("submit");
const submitErrorContainer = loginForm!.querySelector('.login-form__submit-error-message');
const currentPage = currentUrl.searchParams.get('currentPage');
const authenticationEventsArray: EventListener[] = [
  {target: emailInput, type: 'input', handler: validateEmailInput}, {target: passwordInput, type: 'change', handler: validatePasswordInput}, {target: <HTMLElement>loginForm, type: 'submit', handler: submitForm}, {target: <HTMLElement>loginForm, type: 'focusin', handler: resetErrorMessage}
];

type AuthenticationResponse = Token | AuthenticationErrorMessage;

function validateField (field: HTMLInputElement, pattern: RegExp, text: string): void {
  const targetErrorContainer = <HTMLElement>loginForm!.querySelector(`.login-form__${field.name}-error-message`);
  targetErrorContainer!.textContent = '';
  submitButton.disabled = false;
  submitButton.classList.remove('_disabled')
  field.classList.remove('invalid');

  if (field.value.length !== 0 && !pattern.test(field.value)) {
    showErrorMessage(text, targetErrorContainer, field);
  }
}

function showErrorMessage (text: string, targetElement: HTMLElement, field: HTMLInputElement): void {
  targetElement.textContent = `${text}`;
  submitButton.disabled = true;
  submitButton.classList.add('_disabled');
  field.classList.add('invalid');
}

async function sendFormData (url: string) {
  const user = {
    email: emailInput.value,
    password: passwordInput.value,
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify(user),
    })
  
    const data: AuthenticationResponse = await response.json();

    if ('token' in data) {
      return data;
    }

    submitErrorContainer!.textContent = `${data.errorMessage}`;
  } catch (err) {
    console.log(err);
  }
}

function validateEmailInput (): void {
  const message = 'Wrong email format. Please, try again';
  const pattern = /[\w\d-_]+@([\w_-]+\.)+[\w]+/;

  validateField(emailInput, pattern, message);
}

function validatePasswordInput (): void {
  const message = 'Wrong password format. Please, try again';
  const pattern = /([a-zA-Z0-9]{8,})/;

  validateField(passwordInput, pattern, message);
}

function submitForm (e: Event) {
  e.preventDefault();
  sendFormData(authenticationServerUrl)
  .then(data => {
    if (data) {
      setToken(data)
    }
  })
  .then(() => {
    if (getToken()) {
      removeEventListeners(authenticationEventsArray);

      if (!currentUrl.searchParams.get('currentPage')) {
        window.location.replace(`${galleryUrl}?page=1`)
      } else {
        window.location.replace(`${galleryUrl}?page=${currentPage}`)
      }
    }
  }
  )
  
  emailInput.value = '';
  passwordInput.value = '';
}

function resetErrorMessage () {
  submitErrorContainer!.textContent = '';
}

emailInput.addEventListener('input', validateEmailInput);

passwordInput.addEventListener('change', validatePasswordInput);

loginForm!.addEventListener('submit', submitForm);

loginForm!.addEventListener('focusin', resetErrorMessage);







