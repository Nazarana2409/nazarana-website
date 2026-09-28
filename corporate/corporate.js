/* =========================================================
   NAZARANA CORPORATE GIFTING
   Employee Portal Frontend
   ========================================================= */

const SUPABASE_URL =
  "https://seogmslimxytpeoynath.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_MpiriYPS7XgmYaeg_kU5gg_hULjj2wq";

const EMPLOYEE_AUTH_URL =
  `${SUPABASE_URL}/functions/v1/employee-auth`;

const EMPLOYEE_GIFTS_URL =
  `${SUPABASE_URL}/functions/v1/employee-gifts`;


/* =========================================================
   STORAGE KEYS
   ========================================================= */

const STORAGE = {
  accessToken: "nazarana_employee_access_token",
  refreshToken: "nazarana_employee_refresh_token",
  expiresAt: "nazarana_employee_expires_at",
  campaignSlug: "nazarana_campaign_slug"
};


/* =========================================================
   BASIC HELPERS
   ========================================================= */

function getCampaignSlug() {
  const params = new URLSearchParams(window.location.search);

  const fromUrl = params.get("campaign");

  if (fromUrl) {
    const cleaned = fromUrl.trim();

    sessionStorage.setItem(
      STORAGE.campaignSlug,
      cleaned
    );

    return cleaned;
  }

  return sessionStorage.getItem(
    STORAGE.campaignSlug
  );
}


function saveSession(session) {
  if (!session) return;

  if (session.access_token) {
    sessionStorage.setItem(
      STORAGE.accessToken,
      session.access_token
    );
  }

  if (session.refresh_token) {
    sessionStorage.setItem(
      STORAGE.refreshToken,
      session.refresh_token
    );
  }

  if (session.expires_at) {
    sessionStorage.setItem(
      STORAGE.expiresAt,
      String(session.expires_at)
    );
  }
}


function clearEmployeeSession() {
  sessionStorage.removeItem(STORAGE.accessToken);
  sessionStorage.removeItem(STORAGE.refreshToken);
  sessionStorage.removeItem(STORAGE.expiresAt);
}


function getAccessToken() {
  return sessionStorage.getItem(
    STORAGE.accessToken
  );
}


function showElement(element) {
  if (element) {
    element.classList.remove("hidden");
  }
}


function hideElement(element) {
  if (element) {
    element.classList.add("hidden");
  }
}


function setButtonLoading(
  button,
  loading,
  loadingText = "Please wait..."
) {
  if (!button) return;

  if (loading) {
    button.dataset.originalText =
      button.textContent;

    button.textContent = loadingText;
    button.disabled = true;
  } else {
    button.textContent =
      button.dataset.originalText ||
      button.textContent;

    button.disabled = false;
  }
}


/* =========================================================
   MESSAGE HANDLING
   ========================================================= */

function showAuthMessage(
  message,
  type = "error"
) {
  const box =
    document.getElementById("authMessage");

  if (!box) return;

  box.textContent = message;

  box.classList.remove(
    "hidden",
    "error",
    "success"
  );

  box.classList.add(type);
}


function clearAuthMessage() {
  const box =
    document.getElementById("authMessage");

  if (!box) return;

  box.textContent = "";

  box.classList.add("hidden");

  box.classList.remove(
    "error",
    "success"
  );
}


/* =========================================================
   API
   ========================================================= */

async function callEmployeeAuth(
  payload,
  accessToken = null
) {
  const headers = {
    "Content-Type": "application/json",
    "apikey": SUPABASE_PUBLISHABLE_KEY
  };

  if (accessToken) {
    headers.Authorization =
      `Bearer ${accessToken}`;
  }

  const response = await fetch(
    EMPLOYEE_AUTH_URL,
    {
      method: "POST",
      headers,
      body: JSON.stringify(payload)
    }
  );

  let data;

  try {
    data = await response.json();
  } catch {
    data = {
      success: false,
      message:
        "We could not complete your request."
    };
  }

  if (!response.ok && !data.message) {
    data.message =
      "We could not complete your request.";
  }

  return data;
}


async function callEmployeeGifts(payload) {
  const accessToken = getAccessToken();

  if (!accessToken) {
    throw new Error(
      "Your session has expired. Please login again."
    );
  }

  const response = await fetch(
    EMPLOYEE_GIFTS_URL,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_PUBLISHABLE_KEY,
        "Authorization":
          `Bearer ${accessToken}`
      },

      body: JSON.stringify(payload)
    }
  );

  const data = await response.json();

  if (response.status === 401) {
    clearEmployeeSession();
  }

  return data;
}


/* =========================================================
   LOGIN PAGE
   ========================================================= */

function initialiseEmployeeLogin() {
  const firstLoginView =
    document.getElementById(
      "firstLoginView"
    );

  if (!firstLoginView) {
    return;
  }

  const returningLoginView =
    document.getElementById(
      "returningLoginView"
    );

  const createPasswordView =
    document.getElementById(
      "createPasswordView"
    );

  const firstLoginForm =
    document.getElementById(
      "firstLoginForm"
    );

  const returningLoginForm =
    document.getElementById(
      "returningLoginForm"
    );

  const createPasswordForm =
    document.getElementById(
      "createPasswordForm"
    );

  const showReturningLogin =
    document.getElementById(
      "showReturningLogin"
    );

  const showFirstLogin =
    document.getElementById(
      "showFirstLogin"
    );


  /* -------------------------------------------------------
     CAMPAIGN
     ------------------------------------------------------- */

  const campaignSlug =
    getCampaignSlug();

  if (!campaignSlug) {
    showAuthMessage(
      "This employee access link is incomplete. Please use the link shared by your organisation's HR team."
    );

    if (firstLoginForm) {
      const button =
        firstLoginForm.querySelector(
          'button[type="submit"]'
        );

      if (button) {
        button.disabled = true;
      }
    }
  }


  /* -------------------------------------------------------
     SWITCH LOGIN VIEWS
     ------------------------------------------------------- */

  if (showReturningLogin) {
    showReturningLogin.addEventListener(
      "click",
      () => {
        clearAuthMessage();

        hideElement(firstLoginView);
        hideElement(createPasswordView);

        showElement(returningLoginView);
      }
    );
  }


  if (showFirstLogin) {
    showFirstLogin.addEventListener(
      "click",
      () => {
        clearAuthMessage();

        hideElement(returningLoginView);
        hideElement(createPasswordView);

        showElement(firstLoginView);
      }
    );
  }


  /* -------------------------------------------------------
     PASSWORD SHOW / HIDE
     ------------------------------------------------------- */

  document
    .querySelectorAll(".password-toggle")
    .forEach((button) => {
      button.addEventListener(
        "click",
        () => {
          const targetId =
            button.dataset.target;

          const input =
            document.getElementById(
              targetId
            );

          if (!input) return;

          const showing =
            input.type === "text";

          input.type =
            showing
              ? "password"
              : "text";

          button.textContent =
            showing
              ? "Show"
              : "Hide";
        }
      );
    });


  /* -------------------------------------------------------
     FIRST LOGIN
     ------------------------------------------------------- */

  let verifiedEmployeeId = "";
  let verifiedMobile = "";

  if (firstLoginForm) {
    firstLoginForm.addEventListener(
      "submit",
      async (event) => {
        event.preventDefault();

        clearAuthMessage();

        const currentCampaign =
          getCampaignSlug();

        if (!currentCampaign) {
          showAuthMessage(
            "Please use the employee access link shared by your organisation."
          );

          return;
        }

        const employeeId =
          document
            .getElementById("employeeId")
            .value
            .trim();

        const mobile =
          document
            .getElementById("mobile")
            .value
            .trim();

        const button =
          document.getElementById(
            "verifyButton"
          );

        setButtonLoading(
          button,
          true,
          "Verifying..."
        );

        try {
          const result =
            await callEmployeeAuth({
              action: "first_login",
              campaign_slug:
                currentCampaign,
              employee_id: employeeId,
              mobile
            });

          if (!result.success) {
            showAuthMessage(
              result.message ||
              "We could not verify your details."
            );

            return;
          }

          verifiedEmployeeId =
            employeeId;

          verifiedMobile =
            mobile;


          /* Existing employee */
          if (
            result.next_step ===
            "password_login"
          ) {
            hideElement(
              firstLoginView
            );

            showElement(
              returningLoginView
            );

            const returningId =
              document.getElementById(
                "returnEmployeeId"
              );

            if (returningId) {
              returningId.value =
                employeeId;
            }

            showAuthMessage(
              "Welcome back. Please enter your password.",
              "success"
            );

            return;
          }


          /* First-time employee */
          hideElement(firstLoginView);

          showElement(
            createPasswordView
          );

          const welcome =
            document.getElementById(
              "employeeWelcome"
            );

          if (
            welcome &&
            result.employee?.first_name
          ) {
            welcome.textContent =
              `Welcome, ${result.employee.first_name}.`;
          }

          showAuthMessage(
            "Your details have been verified. Please create your password.",
            "success"
          );

        } catch (error) {
          console.error(error);

          showAuthMessage(
            "We couldn't connect to Nazarana right now. Please try again."
          );

        } finally {
          setButtonLoading(
            button,
            false
          );
        }
      }
    );
  }


  /* -------------------------------------------------------
     CREATE PASSWORD
     ------------------------------------------------------- */

  if (createPasswordForm) {
    createPasswordForm.addEventListener(
      "submit",
      async (event) => {
        event.preventDefault();

        clearAuthMessage();

        const password =
          document.getElementById(
            "newPassword"
          ).value;

        const confirmPassword =
          document.getElementById(
            "confirmPassword"
          ).value;

        if (
          password !==
          confirmPassword
        ) {
          showAuthMessage(
            "The passwords do not match."
          );

          return;
        }

        if (
          password.length < 8 ||
          !/[A-Za-z]/.test(password) ||
          !/[0-9]/.test(password)
        ) {
          showAuthMessage(
            "Your password must contain at least 8 characters, including a letter and a number."
          );

          return;
        }

        if (
          !verifiedEmployeeId ||
          !verifiedMobile
        ) {
          showAuthMessage(
            "Your verification has expired. Please start again."
          );

          hideElement(
            createPasswordView
          );

          showElement(
            firstLoginView
          );

          return;
        }

        const button =
          document.getElementById(
            "createPasswordButton"
          );

        setButtonLoading(
          button,
          true,
          "Creating..."
        );

        try {
          const result =
            await callEmployeeAuth({
              action:
                "create_password",

              campaign_slug:
                getCampaignSlug(),

              employee_id:
                verifiedEmployeeId,

              mobile:
                verifiedMobile,

              password
            });

          if (!result.success) {
            showAuthMessage(
              result.message ||
              "We could not create your password."
            );

            return;
          }

          if (
            result.next_step ===
            "password_login"
          ) {
            hideElement(
              createPasswordView
            );

            showElement(
              returningLoginView
            );

            document.getElementById(
              "returnEmployeeId"
            ).value =
              verifiedEmployeeId;

            showAuthMessage(
              result.message ||
              "Password created. Please login.",
              "success"
            );

            return;
          }

          if (result.session) {
            saveSession(
              result.session
            );

            window.location.href =
              `employee-portal.html?campaign=${encodeURIComponent(
                getCampaignSlug()
              )}`;

            return;
          }

          showAuthMessage(
            "Your password was created. Please login.",
            "success"
          );

        } catch (error) {
          console.error(error);

          showAuthMessage(
            "We couldn't complete your account setup. Please try again."
          );

        } finally {
          setButtonLoading(
            button,
            false
          );
        }
      }
    );
  }


  /* -------------------------------------------------------
     RETURNING LOGIN
     ------------------------------------------------------- */

  if (returningLoginForm) {
    returningLoginForm.addEventListener(
      "submit",
      async (event) => {
        event.preventDefault();

        clearAuthMessage();

        const employeeId =
          document
            .getElementById(
              "returnEmployeeId"
            )
            .value
            .trim();

        const password =
          document.getElementById(
            "loginPassword"
          ).value;

        const currentCampaign =
          getCampaignSlug();

        if (!currentCampaign) {
          showAuthMessage(
            "Please use the employee access link shared by your organisation."
          );

          return;
        }

        const button =
          document.getElementById(
            "loginButton"
          );

        setButtonLoading(
          button,
          true,
          "Logging in..."
        );

        try {
          const result =
            await callEmployeeAuth({
              action: "login",

              campaign_slug:
                currentCampaign,

              employee_id:
                employeeId,

              password
            });

          if (!result.success) {
            showAuthMessage(
              result.message ||
              "Invalid Employee ID or password."
            );

            return;
          }

          if (!result.session) {
            showAuthMessage(
              "We could not start your session. Please try again."
            );

            return;
          }

          saveSession(
            result.session
          );

          window.location.href =
            `employee-portal.html?campaign=${encodeURIComponent(
              currentCampaign
            )}`;

        } catch (error) {
          console.error(error);

          showAuthMessage(
            "We couldn't connect to Nazarana right now. Please try again."
          );

        } finally {
          setButtonLoading(
            button,
            false
          );
        }
      }
    );
  }
}


/* =========================================================
   INITIALISE
   ========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {
    initialiseEmployeeLogin();
  }
);
