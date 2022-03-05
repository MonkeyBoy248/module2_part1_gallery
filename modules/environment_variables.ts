const authenticationServerUrl = 'https://hjdjs55gol.execute-api.us-east-1.amazonaws.com/api/login';
const galleryServerUrl = 'https://hjdjs55gol.execute-api.us-east-1.amazonaws.com/api/gallery';
const galleryUrl = new URL(`http://127.0.0.1:5501/pages/index.html`);
const loginUrl = new URL(`http://127.0.0.1:5501/pages/authentication.html`);
const currentUrl = new URL(window.location.href);

export { 
  authenticationServerUrl, 
  galleryServerUrl, 
  galleryUrl, 
  loginUrl, 
  currentUrl
}
