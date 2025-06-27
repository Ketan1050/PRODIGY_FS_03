document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const loginMessage = document.getElementById('login-message');
    const registerForm = document.getElementById('register-form');
    const registerMessage = document.getElementById('register-message');
    const logoutButton = document.getElementById('logout-button');
    const authLinksDiv = document.getElementById('auth-links');
    const userInfoDiv = document.getElementById('user-info');
    const usernameDisplay = document.getElementById('username-display');
    const myOrdersLink = document.getElementById('my-orders-link');


    // Function to check login status and update UI
    function checkLoginStatus() {
        const token = localStorage.getItem('token');
        const username = localStorage.getItem('username');

        if (token && username) {
            // User is logged in
            if (authLinksDiv) authLinksDiv.style.display = 'none';
            if (userInfoDiv) userInfoDiv.style.display = 'flex'; // Use flex to align items
            if (usernameDisplay) usernameDisplay.textContent = username;
            if (myOrdersLink) myOrdersLink.style.display = 'block'; // Show My Orders link
        } else {
            // User is not logged in
            if (authLinksDiv) authLinksDiv.style.display = 'flex'; // Use flex
            if (userInfoDiv) userInfoDiv.style.display = 'none';
            if (myOrdersLink) myOrdersLink.style.display = 'none'; // Hide My Orders link
        }
    }

    // Handle Login Form Submission
    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            loginMessage.textContent = ''; // Clear previous messages
            loginMessage.className = 'form-message'; // Reset class

            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();
                if (response.ok) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('username', data.user.username); // Store username
                    loginMessage.textContent = 'Login successful!';
                    loginMessage.classList.add('success');
                    window.location.href = 'index.html'; // Redirect to home page
                } else {
                    loginMessage.textContent = data.message || 'Login failed.';
                    loginMessage.classList.add('error');
                }
            } catch (error) {
                console.error('Error during login:', error);
                loginMessage.textContent = 'An error occurred. Please try again.';
                loginMessage.classList.add('error');
            }
        });
    }

    // Handle Register Form Submission
    if (registerForm) {
        registerForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const username = document.getElementById('register-username').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;

            registerMessage.textContent = ''; // Clear previous messages
            registerMessage.className = 'form-message'; // Reset class

            try {
                const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, email, password })
                });

                const data = await response.json();
                if (response.ok) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('username', data.user.username); // Store username
                    registerMessage.textContent = 'Registration successful! Redirecting to home...';
                    registerMessage.classList.add('success');
                    setTimeout(() => {
                        window.location.href = 'index.html'; // Redirect to home after a brief delay
                    }, 1500);
                } else {
                    registerMessage.textContent = data.message || 'Registration failed.';
                    registerMessage.classList.add('error');
                }
            } catch (error) {
                console.error('Error during registration:', error);
                registerMessage.textContent = 'An error occurred. Please try again.';
                registerMessage.classList.add('error');
            }
        });
    }

    // Handle Logout
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('token');
            localStorage.removeItem('username');
            alert('You have been logged out.');
            checkLoginStatus(); // Update UI
            // Redirect to home or login page
            window.location.href = 'index.html';
        });
    }

    // Initial check on page load
    checkLoginStatus();
});