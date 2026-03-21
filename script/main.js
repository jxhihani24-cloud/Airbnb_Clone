// Wait until the HTML document is fully loaded before running the script
document.addEventListener('DOMContentLoaded', () => {

    // Get the theme toggle checkbox element from the DOM
    const toggle = document.getElementById('themeToggle');

    // Retrieve the saved theme from localStorage
    // If nothing is saved, default to 'dark'
    const savedTheme = localStorage.getItem('theme') || 'dark';

    // If the saved theme is light mode
    if (savedTheme === 'light') {
        // Add 'light' class to the body (enables light theme styles)
        document.body.classList.add('light');

        // Set toggle switch to OFF position (assuming OFF = light mode)
        toggle.checked = false;
    } else {
        // Otherwise, ensure light class is removed (dark mode active)
        document.body.classList.remove('light');

        // Set toggle switch to ON position (assuming ON = dark mode)
        toggle.checked = true;
    }

    // Listen for changes when the user toggles the switch
    toggle.addEventListener('change', () => {

        // If toggle is checked → Dark mode selected
        if (toggle.checked) {
            // Remove 'light' class to apply dark theme
            document.body.classList.remove('light');

            // Save user's preference as 'dark' in localStorage
            localStorage.setItem('theme', 'dark');
        } else {
            // If toggle is unchecked → Light mode selected

            // Add 'light' class to apply light theme
            document.body.classList.add('light');

            // Save user's preference as 'light' in localStorage
            localStorage.setItem('theme', 'light');
        }
    });
});
