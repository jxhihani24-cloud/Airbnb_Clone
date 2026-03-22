//set dark mode on page load
document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('themeToggle');

    // Load saved theme
    const savedTheme = localStorage.getItem('theme') || 'dark';

    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        toggle.checked = true;
    }

    // Toggle event
    toggle.addEventListener('change', () => {
        if (toggle.checked) {
            document.body.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.classList.remove('dark-mode');
            localStorage.setItem('theme', 'light');
        }
    });
   
});

// ===== FUNCTION TO SHOW OR HIDE PASSWORD USING THE EYE ICON ===== //
function showPassword(){
    const pass=document.getElementById("password");
    if(password.type==="password")
        password.type="text";
    else
        password.type="password";

}

 