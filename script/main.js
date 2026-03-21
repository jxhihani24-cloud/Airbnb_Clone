/* This is the main JavaScript file for general website behavior used on many pages.

Typical things inside:

menu button behavior
dark/light interactions
shared buttons
general event listeners*/

//set dark mode on page load
document.addEventListener('DOMContentLoaded', () => {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.body.classList.add('dark-mode');
});
