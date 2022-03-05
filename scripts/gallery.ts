import { getToken, deleteToken } from "../modules/token_management";
import { galleryServerUrl, loginUrl, currentUrl } from "../modules/environment_variables";
import * as eventListenersManagement from "../modules/event_listeners_management";

const galleryPhotos = document.querySelector('.gallery__photos') as HTMLElement;
const galleryTemplate = document.querySelector('.gallery__template') as HTMLTemplateElement;
const pagesLinksList = document.querySelector('.gallery__links-list') as HTMLElement;
const galleryErrorMessage = document.querySelector('.gallery__error-message') as HTMLElement;
const galleryPopup = document.querySelector('.gallery__error-pop-up') as HTMLElement;
const galleryLinkTemplate = document.querySelector('.gallery__link-template') as HTMLTemplateElement;
const galleryEventsArray: eventListenersManagement.EventListener[] = [
  {target: document, type: 'DOMContentLoaded', handler: getCurrentPageImages},
  {target: pagesLinksList, type: 'click', handler: changeCurrentPage},
]

interface GalleryData {
  objects: string[];
  page: number;
  total: number;
}

async function getPicturesData (url: string): Promise<void>{
  if (getToken()) {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: getToken().token,
        },
      })
    
      const data: GalleryData = await response.json();
      console.log(data);
      createPictureTemplate(data);
      createLinksTemplate(data.total);
    } catch {
      showMessage(`There is no page with number ${url.charAt(url.length - 1)}. Please, enter a new value in the address bar`);
    }
  }
}

function createPictureTemplate (pictures: GalleryData): void {
  galleryPhotos.innerHTML = ''

  for (let object of pictures.objects) {
    const picture = galleryTemplate.content.cloneNode(true) as HTMLElement;
    const imageWrapper = picture.children[0];
    const image = imageWrapper.querySelector('.gallery__img') as HTMLElement;
    
    image.setAttribute('src', object);
    galleryPhotos.insertAdjacentElement('beforeend', imageWrapper);
  }
}

function createLinksTemplate (total: number): void {
  pagesLinksList.innerHTML = '';

  for (let i = 0; i < total; i++) {
    const linkWrapper = galleryLinkTemplate.content.cloneNode(true) as HTMLElement;
    const listItem = linkWrapper.children[0] as HTMLElement;
    const link = listItem.querySelector('a');
    
    if (link) {
      link.textContent = `${i + 1}`;
      pagesLinksList.insertAdjacentElement('beforeend', listItem);
      pagesLinksList.children[0].classList.add('active');
    }
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
    eventListenersManagement.removeEventListeners(galleryEventsArray);
    setTimeout(() => {
      window.location.replace(`${loginUrl}?currentPage=${currentUrl.searchParams.get('page')}`);
    }, delay)
  }
}

function getCurrentPageImages (): void {
  if(!currentUrl.searchParams.get('page')) {
    getPicturesData(`${galleryServerUrl}?page=1`)
  }else {
    getPicturesData(`${galleryServerUrl}?page=${currentUrl.searchParams.get('page')}`);
  }

  const currentActiveLink = pagesLinksList.querySelector('.active');
  
  for (let item of pagesLinksList.children) {
    const link = item.querySelector('a');
    
    if (link?.textContent) {
      item.setAttribute('page-number', link.textContent);
    }
    
    if (item.getAttribute('page-number') === currentUrl.searchParams.get('page')) {
      currentActiveLink?.classList.remove('active');
      item.classList.add('active');
    }
  }

  redirectWhenTokenExpires(5000);
}

function changeCurrentPage (e: Event): void {
  const currentActiveLink = pagesLinksList.querySelector('.active');
  e.preventDefault();
  const target = e.target as HTMLElement;
  const targetClosestLi = target.closest('li');

  if (currentActiveLink !== targetClosestLi) {
    setNewUrl(targetClosestLi?.getAttribute('page-number')!);
    getPicturesData(`${galleryServerUrl}?page=${currentUrl.searchParams.get('page')}`);
    
    currentActiveLink?.classList.remove('active');
    target.classList.add('active');

    redirectWhenTokenExpires(5000);
  }
}

document.addEventListener('DOMContentLoaded', getCurrentPageImages);
pagesLinksList.addEventListener('click', changeCurrentPage);

setInterval(() => {
  deleteToken();
  redirectWhenTokenExpires(5000);
}, 300000)




