// basic form validation for registration
function validateRegisterForm() {
  var username = document.getElementById('username');
  var email = document.getElementById('email');
  var password = document.getElementById('password');
  var usernameError = document.getElementById('username-error');
  var emailError = document.getElementById('email-error');
  var passwordError = document.getElementById('password-error');
  
  var isValid = true;
  
  // clear previous errors
  if (usernameError) usernameError.textContent = '';
  if (emailError) emailError.textContent = '';
  if (passwordError) passwordError.textContent = '';
  
  // validate username
  if (username && username.value.trim().length < 3) {
    if (usernameError) {
      usernameError.textContent = 'Username must be at least 3 characters';
    }
    isValid = false;
  }
  
  // validate email
  if (email && !email.value.includes('@')) {
    if (emailError) {
      emailError.textContent = 'Please enter a valid email';
    }
    isValid = false;
  }
  
  // validate password
  if (password && password.value.length < 6) {
    if (passwordError) {
      passwordError.textContent = 'Password must be at least 6 characters';
    }
    isValid = false;
  }
  
  return isValid;
}

// basic form validation for new post
function validateNewPostForm() {
  var title = document.getElementById('title');
  var content = document.getElementById('content');
  var titleError = document.getElementById('title-error');
  var contentError = document.getElementById('content-error');
  
  var isValid = true;
  
  // clear previous errors
  if (titleError) titleError.textContent = '';
  if (contentError) contentError.textContent = '';
  
  // validate title
  if (title && title.value.trim().length === 0) {
    if (titleError) {
      titleError.textContent = 'Title is required';
    }
    isValid = false;
  }
  
  // validate content
  if (content && content.value.trim().length === 0) {
    if (contentError) {
      contentError.textContent = 'Content is required';
    }
    isValid = false;
  }
  
  return isValid;
}

// probably could clean this up more but it works
function setupFormValidation() {
  var registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', function(e) {
      if (!validateRegisterForm()) {
        e.preventDefault();
      }
    });
  }
  
  var newPostForm = document.getElementById('newPostForm');
  if (newPostForm) {
    newPostForm.addEventListener('submit', function(e) {
      if (!validateNewPostForm()) {
        e.preventDefault();
      }
    });
  }
  
  var editPostForm = document.getElementById('editPostForm');
  if (editPostForm) {
    editPostForm.addEventListener('submit', function(e) {
      if (!validateNewPostForm()) {
        e.preventDefault();
      }
    });
  }
}

// run when page loads
document.addEventListener('DOMContentLoaded', function() {
  setupFormValidation();
});

