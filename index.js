/**
 * Sets the minimum height of the main content to be equal to the viewport.
 * The viewport equals max-height minus the height of the header and footer.  
 * @returns {void}
*/
window.onload = function() {
  const headerHeight = document.querySelector('header').offsetHeight;
  const footerHeight = document.querySelector('footer').offsetHeight;
  const mainContent = document.querySelector('#main-content');
  mainContent.style.minHeight = `calc(100vh - ${headerHeight}px - ${footerHeight}px)`;
}
