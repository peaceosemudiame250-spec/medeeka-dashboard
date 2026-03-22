const input = document.querySelector("#phone");
const doctorInput = document.querySelector("#doctor-phone");

// Initialize date picker
flatpickr("#dob", {
  dateFormat: "Y-m-d",
  maxDate: "today",
  mode: "single",
});

window.intlTelInput(input, {
  separateDialCode: true,
  allowDropdown: true,
  dropdownContainer: document.body,
  utilsScript:
    "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/18.1.1/js/utils.js",
});
window.intlTelInput(doctorInput, {
  separateDialCode: true,
  allowDropdown: true,
  dropdownContainer: document.body,
  utilsScript:
    "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/18.1.1/js/utils.js",
});

// Password validation function
function validatePassword(passwordFieldId, requirementsPrefix) {
  const passwordField = document.getElementById(passwordFieldId);
  if (!passwordField) return;

  const password = passwordField.value;
  const requirements = {
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    numeric: /[0-9]/.test(password),
    symbol: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    length: password.length >= 8,
  };

  // Update UI for each requirement
  for (const [key, met] of Object.entries(requirements)) {
    const element = document.getElementById(`${requirementsPrefix}-${key}`);
    if (element) {
      const indicator = element.querySelector(".indicator");
      if (met) {
        element.classList.add("met");
        indicator.textContent = "✓";
      } else {
        element.classList.remove("met");
        indicator.textContent = "✗";
      }
    }
  }
}

// Setup password validation for all password fields
const passwordFields = [
  { id: "register-password", prefix: "register-req" },
  { id: "login-password", prefix: "login-req" },
  { id: "doctor-register-password", prefix: "doctor-register-req" },
  { id: "doctor-login-password", prefix: "doctor-login-req" },
];

passwordFields.forEach((field) => {
  const element = document.getElementById(field.id);
  if (element) {
    element.addEventListener("input", () => {
      validatePassword(field.id, field.prefix);
    });
  }
});

// Show/Hide page function
function showPage(page) {
  document
    .querySelectorAll(".page")
    .forEach((p) => p.classList.remove("active"));
  document.getElementById(page).classList.add("active");
}

// Terms and Conditions Modal Functions
function showTermsModal(event) {
  event.preventDefault();
  document.getElementById("terms-modal").classList.add("active");
}

function closeTermsModal() {
  document.getElementById("terms-modal").classList.remove("active");
}

// Close modal when clicking outside of it
window.addEventListener("click", (event) => {
  const modal = document.getElementById("terms-modal");
  if (event.target === modal) {
    closeTermsModal();
  }
});

// Password Match Validation
function validatePasswordMatch(
  passwordFieldId,
  confirmPasswordFieldId,
  errorElementId,
) {
  const passwordField = document.getElementById(passwordFieldId);
  const confirmPasswordField = document.getElementById(confirmPasswordFieldId);
  const errorElement = document.getElementById(errorElementId);

  if (!passwordField || !confirmPasswordField || !errorElement) return;

  const checkMatch = () => {
    if (
      confirmPasswordField.value &&
      passwordField.value !== confirmPasswordField.value
    ) {
      errorElement.classList.add("show");
      confirmPasswordField.classList.add("error");
      return false;
    } else {
      errorElement.classList.remove("show");
      confirmPasswordField.classList.remove("error");
      return true;
    }
  };

  confirmPasswordField.addEventListener("input", checkMatch);
  passwordField.addEventListener("input", checkMatch);
}

// Setup password match validation
validatePasswordMatch(
  "register-password",
  "patient-confirm-password",
  "patient-password-error",
);
validatePasswordMatch(
  "doctor-register-password",
  "doctor-register-confirm-password",
  "doctor-register-password-error",
);

// Handle Create Account button states based on checkbox
const userTermsCheckbox = document.getElementById("user-terms");
const doctorTermsCheckbox = document.getElementById("doctor-terms");
const userCreateBtn = document.getElementById("user-create-btn");
const doctorCreateBtn = document.getElementById("doctor-create-btn");

if (userTermsCheckbox && userCreateBtn) {
  userTermsCheckbox.addEventListener("change", () => {
    userCreateBtn.disabled = !userTermsCheckbox.checked;
  });
  userCreateBtn.disabled = true;
}

if (doctorTermsCheckbox && doctorCreateBtn) {
  doctorTermsCheckbox.addEventListener("change", () => {
    doctorCreateBtn.disabled = !doctorTermsCheckbox.checked;
  });
  doctorCreateBtn.disabled = true;
}

// Specialization "Other" field handler
const specializationSelect = document.getElementById("specialization-select");
const customSpecializationGroup = document.getElementById(
  "custom-specialization-group",
);
const customSpecializationInput = document.getElementById(
  "custom-specialization-input",
);

if (specializationSelect) {
  specializationSelect.addEventListener("change", (e) => {
    if (e.target.value === "Other") {
      customSpecializationGroup.style.display = "block";
      customSpecializationInput.required = true;
    } else {
      customSpecializationGroup.style.display = "none";
      customSpecializationInput.required = false;
      customSpecializationInput.value = "";
    }
  });
}

// Form Submission Handlers
function showMessage(elementId, message, isError = false) {
  const messageElement = document.getElementById(elementId);
  if (messageElement) {
    messageElement.textContent = message;
    messageElement.className = `form-message ${isError ? "error" : "success"}`;
    messageElement.style.display = "block";
  }
}

function clearMessage(elementId) {
  const messageElement = document.getElementById(elementId);
  if (messageElement) {
    messageElement.style.display = "none";
    messageElement.textContent = "";
  }
}

function isPasswordValid(password) {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
  );
}

// User Registration Form Submission
const userRegisterForm = document.querySelector("#user-register-form");
if (userRegisterForm) {
  userRegisterForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearMessage("user-register-message");

    const email = document.getElementById("user-email").value;
    const password = document.getElementById("register-password").value;
    const confirmPassword = document.getElementById(
      "user-confirm-password",
    ).value;

    // Validation
    if (password !== confirmPassword) {
      showMessage("user-register-message", "Passwords do not match", true);
      return;
    }

    if (!isPasswordValid(password)) {
      showMessage(
        "user-register-message",
        "Password does not meet requirements",
        true,
      );
      return;
    }

    const submitBtn = userRegisterForm.querySelector("#user-create-btn");
    submitBtn.disabled = true;
    submitBtn.textContent = "Creating Account...";

    try {
      const payload = {
        email,
        password,
        fullName: document.getElementById("user-fullname").value,
        dateOfBirth: document.getElementById("user-dob").value,
        gender: document.getElementById("user-gender").value,
        emergencyContact: document.getElementById("user-emergency").value,
        phoneNumber: document.querySelector("#phone").value,
        bloodGroup: document.getElementById("user-bloodgroup").value,
        knownConditions: document.getElementById("user-conditions").value,
        allergies: document.getElementById("user-allergies").value,
      };

      console.log("📤 Sending registration data:", payload);

      const response = await fetch(
        "https://medeeka-dashboard.onrender.com/api/auth/user/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json();
      console.log("📥 Backend response:", data);

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      // Save token and user info to localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("userType", "user");
      localStorage.setItem("userId", data.user.id);
      localStorage.setItem("userEmail", data.user.email);
      localStorage.setItem("userFullName", data.user.fullName);

      showMessage(
        "user-register-message",
        "Account created successfully! Redirecting to dashboard...",
      );
      userRegisterForm.reset();
      setTimeout(() => {
        window.location.href = "User Page/user.html";
      }, 2000);
    } catch (error) {
      showMessage(
        "user-register-message",
        error.message || "Registration failed. Please try again.",
        true,
      );
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Create Account";
    }
  });
}

// Doctor Registration Form Submission
const doctorRegisterForm = document.querySelector("#doctor-register");
if (doctorRegisterForm) {
  doctorRegisterForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearMessage("doctor-register-message");

    const password = document.getElementById("doctor-register-password").value;
    const confirmPassword = document.getElementById(
      "doctor-register-confirm-password",
    ).value;
    const email = doctorRegisterForm.querySelector('input[type="email"]').value;

    // Validation
    if (password !== confirmPassword) {
      showMessage("doctor-register-message", "Passwords do not match", true);
      return;
    }

    if (!isPasswordValid(password)) {
      showMessage(
        "doctor-register-message",
        "Password does not meet requirements",
        true,
      );
      return;
    }

    const submitBtn = doctorRegisterForm.querySelector("#doctor-create-btn");
    submitBtn.disabled = true;
    submitBtn.textContent = "Creating Account...";

    try {
      // TODO: Replace with your actual API endpoint
      const response = await fetch(
        "https://medeeka-dashboard.onrender.com/api/auth/doctor/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
            fullName: doctorRegisterForm.querySelector(
              'input[placeholder="Dr. John Doe"]',
            ).value,
            phoneNumber: document.querySelector("#doctor-phone").value,
            specialization:
              document.getElementById("specialization-select").value === "Other"
                ? document.getElementById("custom-specialization-input").value
                : document.getElementById("specialization-select").value,
            medicalLicenseNumber: doctorRegisterForm.querySelector(
              'input[placeholder="License Number"]',
            ).value,
            hospital: doctorRegisterForm.querySelector(
              'input[placeholder="Hospital or Clinic Name"]',
            ).value,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      showMessage(
        "doctor-register-message",
        "Account created successfully! Redirecting...",
      );
      doctorRegisterForm.reset();
      setTimeout(() => {
        showPage("doctor-login");
      }, 2000);
    } catch (error) {
      showMessage(
        "doctor-register-message",
        error.message || "Registration failed. Please try again.",
        true,
      );
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Create Account";
    }
  });
}

// User Login Form Submission
const userLoginForm = document.querySelector("#login");
if (userLoginForm) {
  const loginBtn = userLoginForm.querySelector(".btn");
  if (loginBtn) {
    loginBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      clearMessage("user-login-message");

      const email = userLoginForm.querySelector('input[type="email"]').value;
      const password = userLoginForm.querySelector(
        'input[type="password"]',
      ).value;

      if (!email || !password) {
        showMessage(
          "user-login-message",
          "Please enter email and password",
          true,
        );
        return;
      }

      loginBtn.disabled = true;
      loginBtn.textContent = "Signing In...";

      try {
        const response = await fetch(
          "https://medeeka-dashboard.onrender.com/api/auth/user/login",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
          },
        );

        const data = await response.json();
        console.log("📥 Login response:", data);

        if (!response.ok) {
          throw new Error(data.message || "Login failed");
        }

        // Save token and user info to localStorage
        localStorage.setItem("token", data.token);
        localStorage.setItem("userType", "user");
        localStorage.setItem("userId", data.user.id);
        localStorage.setItem("userEmail", data.user.email);
        localStorage.setItem("userFullName", data.user.fullName);

        showMessage(
          "user-login-message",
          "Login successful! Redirecting to dashboard...",
        );
        setTimeout(() => {
          window.location.href = "User Page/user.html";
        }, 1500);
      } catch (error) {
        showMessage(
          "user-login-message",
          error.message || "Login failed. Please try again.",
          true,
        );
      } finally {
        loginBtn.disabled = false;
        loginBtn.textContent = "Sign In";
      }
    });
  }
}

// Doctor Login Form Submission
const doctorLoginForm = document.querySelector("#doctor-login");
if (doctorLoginForm) {
  const doctorLoginBtn = doctorLoginForm.querySelector(".btn");
  if (doctorLoginBtn) {
    doctorLoginBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      clearMessage("doctor-login-message");

      const email = doctorLoginForm.querySelector('input[type="email"]').value;
      const password = doctorLoginForm.querySelector(
        'input[type="password"]',
      ).value;

      if (!email || !password) {
        showMessage(
          "doctor-login-message",
          "Please enter email and password",
          true,
        );
        return;
      }

      doctorLoginBtn.disabled = true;
      doctorLoginBtn.textContent = "Signing In...";

      try {
        // TODO: Replace with your actual API endpoint
        const response = await fetch(
          "https://medeeka-dashboard.onrender.com/api/auth/doctor/login",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Login failed");
        }

        // TODO: Save token to localStorage or session
        localStorage.setItem("token", data.token);
        localStorage.setItem("userType", "doctor");

        showMessage("doctor-login-message", "Login successful! Redirecting...");
        setTimeout(() => {
          // TODO: Redirect to doctor dashboard
          window.location.href = "/doctor-dashboard";
        }, 1500);
      } catch (error) {
        showMessage(
          "doctor-login-message",
          error.message || "Login failed. Please try again.",
          true,
        );
      } finally {
        doctorLoginBtn.disabled = false;
        doctorLoginBtn.textContent = "Sign In";
      }
    });
  }
}
