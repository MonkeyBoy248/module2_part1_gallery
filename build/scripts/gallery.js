var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { getToken, deleteToken } from "../modules/token_management.js";
import { galleryServerUrl, loginUrl, currentUrl } from "../modules/environment_variables.js";
import { removeEventListeners } from "../modules/event_listeners_management.js";
const galleryPhotos = document.querySelector('.gallery__photos');
const galleryTemplate = document.querySelector('.gallery__template');
const pagesLinksContainer = document.querySelector('.gallery__links-list');
const galleryErrorMessage = document.querySelector('.gallery__error-message');
const galleryPopup = document.querySelector('.gallery__error-pop-up');
const galleryEventsArray = [
    { target: document, type: 'DOMContentLoaded', handler: getCurrentPageImages },
    { target: pagesLinksContainer, type: 'click', handler: changeCurrentPage },
];
function getPicturesData(url) {
    return __awaiter(this, void 0, void 0, function* () {
        if (getToken()) {
            try {
                const response = yield fetch(url, {
                    method: 'GET',
                    headers: {
                        Authorization: getToken().token,
                    },
                });
                const data = yield response.json();
                createPictureTemplate(data);
            }
            catch (_a) {
                showMessage(`There is no page with number ${url.charAt(url.length - 1)}. Please, enter a new value in the address bar`);
            }
        }
    });
}
function createPictureTemplate(pictures) {
    galleryPhotos.innerHTML = '';
    for (let object of pictures.objects) {
        const picture = galleryTemplate.content.cloneNode(true);
        const image = picture.children[0].querySelector('.gallery__img');
        image.setAttribute('src', object);
        galleryPhotos.insertAdjacentElement('beforeend', image);
    }
}
function setNewUrl(params) {
    window.location.href = window.location.origin + window.location.pathname + `?page=${params}`;
}
function showMessage(text) {
    galleryPopup.classList.add('show');
    galleryErrorMessage.textContent = '';
    galleryErrorMessage.textContent = text;
}
function updateMessageBeforeRedirection(timer) {
    let time = setInterval(() => {
        --timer;
        if (timer <= 0)
            clearInterval(time);
        showMessage(`Token validity time is expired. You will be redirected to authorization page in ${timer} seconds`);
    }, 1000);
}
function redirectWhenTokenExpires(delay) {
    if (!getToken()) {
        updateMessageBeforeRedirection(delay / 1000);
        removeEventListeners(galleryEventsArray);
        setTimeout(() => {
            window.location.replace(`${loginUrl}?currentPage=${currentUrl.searchParams.get('page')}`);
        }, delay);
    }
}
function getCurrentPageImages() {
    if (!currentUrl.searchParams.get('page')) {
        getPicturesData(`${galleryServerUrl}?page=1`);
    }
    else {
        getPicturesData(`${galleryServerUrl}?page=${currentUrl.searchParams.get('page')}`);
    }
    const currentActiveLink = pagesLinksContainer.querySelector('.active');
    for (let link of pagesLinksContainer.children) {
        link.setAttribute('page-number', link.querySelector('a').innerText);
        if (link.getAttribute('page-number') === currentUrl.searchParams.get('page')) {
            currentActiveLink.classList.remove('active');
            link.classList.add('active');
        }
    }
    redirectWhenTokenExpires(5000);
}
function changeCurrentPage(e) {
    const currentActiveLink = pagesLinksContainer.querySelector('.active');
    e.preventDefault();
    const target = e.target;
    const targetClosestLi = target.closest('li');
    if (currentActiveLink !== targetClosestLi) {
        setNewUrl(targetClosestLi.getAttribute('page-number'));
        getPicturesData(`${galleryServerUrl}?page=${currentUrl.searchParams.get('page')}`);
        currentActiveLink.classList.remove('active');
        target.classList.add('active');
        redirectWhenTokenExpires(5000);
    }
}
document.addEventListener('DOMContentLoaded', getCurrentPageImages);
pagesLinksContainer.addEventListener('click', changeCurrentPage);
setInterval(() => {
    deleteToken();
    redirectWhenTokenExpires(5000);
}, 300000);
