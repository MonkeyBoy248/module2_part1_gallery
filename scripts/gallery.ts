import { getToken, deleteToken, Token } from "../modules/token_management";
import { galleryServerUrl, loginUrl, currentUrl } from "../modules/environment_variables";
import { removeEventListeners, EventListener } from "../modules/event_listeners_management";

const galleryPhotos = <HTMLElement>document.querySelector('.gallery__photos');
const galleryTemplate = <HTMLTemplateElement>document.querySelector('.gallery__template');
const pagesLinksContainer = <HTMLElement>document.querySelector('.gallery__links-list');
const galleryErrorMessage = <HTMLElement>document.querySelector('.gallery__error-message');
const galleryPopup = <HTMLElement>document.querySelector('.gallery__error-pop-up');
const galleryEventsArray: EventListener[] = [
  {target: document, type: 'DOMContentLoaded', handler: getCurrentPageImages},
  {target: pagesLinksContainer, type: 'click', handler: changeCurrentPage},
]

interface GalleryData {
  objects: string[];
  page: number;
  total: number;
}

async function getPicturesData (url: string): Promise<void> {
  if (getToken()) {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: getToken().token,
        },
      })
    
      const data: GalleryData = await response.json();
      createPictureTemplate(data);
    } catch {
      showMessage(`There is no page with number ${url.charAt(url.length - 1)}. Please, enter a new value in the address bar`);
    }
  }
}

function createPictureTemplate (pictures: GalleryData): void {
  galleryPhotos.innerHTML = ''

  for (let object of pictures.objects) {
    const picture = <HTMLElement>galleryTemplate.content.cloneNode(true);
    const image = <HTMLElement>picture.children[0].querySelector('.gallery__img');
    
    image!.setAttribute('src', object);
    galleryPhotos.insertAdjacentElement('beforeend', image);
  }
}

function setNewUrl (params: URLSearchParams | string): void {
  window.location.href = window.location.origin + window.location.pathname + `?page=${params}`;
}

function showMessage (text: string): void {
  galleryPopup.classList.add('show');
  galleryErrorMessage.textContent = '';
  galleryErrorMessage.textContent = text;
}

function updateMessageBeforeRedirection (timer: number): void {
  let time = setInterval(() => {
    --timer;
    if (timer <= 0) clearInterval(time);
    showMessage(`Token validity time is expired. You will be redirected to authorization page in ${timer} seconds`);
  }, 1000);
}

function redirectWhenTokenExpires (delay: number): void {
  if (!getToken()) {
    updateMessageBeforeRedirection(delay / 1000);
    removeEventListeners(galleryEventsArray);
    setTimeout(() => {
      window.location.replace(`${loginUrl}?currentPage=${currentUrl.searchParams.get('page')}`);
    }, delay)
  }
}

function getCurrentPageImages (): void {
  if(!currentUrl.searchParams.get('page')) {
    getPicturesData(`${galleryServerUrl}?page=1`);
  }else {
    getPicturesData(`${galleryServerUrl}?page=${currentUrl.searchParams.get('page')}`);
  }

  const currentActiveLink = pagesLinksContainer.querySelector('.active');
  
  for (let link of pagesLinksContainer.children) {
    link.setAttribute('page-number', link.querySelector('a')!.innerText);

    if (link.getAttribute('page-number') === currentUrl.searchParams.get('page')) {
      currentActiveLink!.classList.remove('active');
      link.classList.add('active');
    }
  }

  redirectWhenTokenExpires(5000);
}

function changeCurrentPage (e: Event): void {
  const currentActiveLink = pagesLinksContainer.querySelector('.active');
  e.preventDefault();
  const target = <HTMLElement>e.target!
  const targetClosestLi = target.closest('li');

  if (currentActiveLink !== targetClosestLi) {
    setNewUrl(targetClosestLi!.getAttribute('page-number')!);
    getPicturesData(`${galleryServerUrl}?page=${currentUrl.searchParams.get('page')}`);
    
    currentActiveLink!.classList.remove('active');
    target.classList.add('active');

    redirectWhenTokenExpires(5000);
  }
}

document.addEventListener('DOMContentLoaded', getCurrentPageImages);
pagesLinksContainer.addEventListener('click', changeCurrentPage);

setInterval(() => {
  deleteToken();
  redirectWhenTokenExpires(5000);
}, 300000)






