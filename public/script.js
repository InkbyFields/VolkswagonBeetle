document.getElementById('registerBtn').addEventListener('click', registerUser);
document.getElementById('loginBtn').addEventListener('click', loginUser);

// Function to show loading state on buttons
function showLoading(button) {
    button.disabled = true;
    button.textContent = 'Loading...'; // Change the button text to "Loading..."
}

// Function to hide loading state on buttons
function hideLoading(button, originalText) {
    button.disabled = false;
    button.textContent = originalText; // Change the button text back to the original
}

// Function to handle user registration
async function registerUser() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const button = document.getElementById('registerBtn');

    if (!username || !password) {
        alert('Please enter both username and password.');
        return;
    }

    showLoading(button); // Show loading indicator

    try {
        const response = await fetch('/api/users/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        if (response.ok) {
            alert('User registered successfully!');
        } else {
            alert('Registration failed: ' + data.message);
        }
    } catch (error) {
        alert('An error occurred while registering the user.');
        console.error(error);
    } finally {
        hideLoading(button, 'Register'); // Hide loading indicator
    }
}

// Function to handle user login
async function loginUser() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const button = document.getElementById('loginBtn');

    if (!username || !password) {
        alert('Please enter both username and password.');
        return;
    }

    showLoading(button); // Show loading indicator

    try {
        const response = await fetch('/api/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        if (response.ok) {
            localStorage.setItem('token', data.token); // Store JWT token
            alert('Login successful!');
        } else {
            alert('Login failed: ' + data.message);
        }
    } catch (error) {
        alert('An error occurred while logging in.');
        console.error(error);
    } finally {
        hideLoading(button, 'Login'); // Hide loading indicator
    }
}

// Debugging to ensure that the script runs
console.log('Script loaded successfully');





