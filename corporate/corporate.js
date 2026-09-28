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
/* =========================================================
   EMPLOYEE GIFT PORTAL
   ========================================================= */

let portalData = null;
let pendingGift = null;


/* ---------------------------------------------------------
   SAFE TEXT
   --------------------------------------------------------- */

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


/* ---------------------------------------------------------
   MONEY
   --------------------------------------------------------- */

function formatINR(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "";
  }

  return new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }
  ).format(number);
}


/* ---------------------------------------------------------
   DATE
   --------------------------------------------------------- */

function formatPortalDate(value) {
  if (!value) {
    return "As shared by HR";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "As shared by HR";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "numeric",
      month: "long",
      year: "numeric"
    }
  ).format(date);
}


/* ---------------------------------------------------------
   PLACEHOLDER IMAGE

   Temporary visual until Nazarana's final lifestyle and
   hamper photography is uploaded to Supabase.
   --------------------------------------------------------- */

function placeholderImage(type = "lifestyle") {
  if (type === "hamper") {
    return (
      "data:image/svg+xml;charset=UTF-8," +
      encodeURIComponent(`
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="900"
          height="650"
          viewBox="0 0 900 650"
        >
          <rect
            width="900"
            height="650"
            fill="#f5eee4"
          />

          <circle
            cx="450"
            cy="270"
            r="105"
            fill="none"
            stroke="#c5a46d"
            stroke-width="2"
          />

          <text
            x="450"
            y="285"
            text-anchor="middle"
            fill="#6f263d"
            font-family="Georgia, serif"
            font-size="72"
          >
            N
          </text>

          <text
            x="450"
            y="430"
            text-anchor="middle"
            fill="#8a7569"
            font-family="Arial, sans-serif"
            font-size="20"
            letter-spacing="5"
          >
            YOUR NAZARANA
          </text>
        </svg>
      `)
    );
  }

  return (
    "data:image/svg+xml;charset=UTF-8," +
    encodeURIComponent(`
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="1000"
        height="800"
        viewBox="0 0 1000 800"
      >
        <defs>
          <linearGradient
            id="bg"
            x1="0"
            y1="0"
            x2="1"
            y2="1"
          >
            <stop
              offset="0%"
              stop-color="#efe3d3"
            />

            <stop
              offset="100%"
              stop-color="#dcc5aa"
            />
          </linearGradient>
        </defs>

        <rect
          width="1000"
          height="800"
          fill="url(#bg)"
        />

        <circle
          cx="500"
          cy="330"
          r="125"
          fill="none"
          stroke="#a9834f"
          stroke-width="2"
        />

        <text
          x="500"
          y="355"
          text-anchor="middle"
          fill="#6f263d"
          font-family="Georgia, serif"
          font-size="100"
        >
          N
        </text>

        <text
          x="500"
          y="540"
          text-anchor="middle"
          fill="#6f263d"
          font-family="Georgia, serif"
          font-size="35"
          letter-spacing="4"
        >
          NAZARANA
        </text>

        <text
          x="500"
          y="585"
          text-anchor="middle"
          fill="#816c60"
          font-family="Arial, sans-serif"
          font-size="16"
          letter-spacing="3"
        >
          AN OFFERING WITH LOVE AND RESPECT
        </text>
      </svg>
    `)
  );
}


/* ---------------------------------------------------------
   PRODUCT DETAILS
   --------------------------------------------------------- */

function formatProductDetails(details) {
  if (!details) {
    return "";
  }

  if (Array.isArray(details)) {
    return details
      .map((item) => {
        if (
          typeof item === "string"
        ) {
          return item;
        }

        if (
          item &&
          typeof item === "object"
        ) {
          return (
            item.name ||
            item.title ||
            item.product ||
            item.description ||
            ""
          );
        }

        return "";
      })
      .filter(Boolean)
      .join(" • ");
  }

  if (typeof details === "string") {
    return details;
  }

  return "";
}


/* ---------------------------------------------------------
   PORTAL ERROR
   --------------------------------------------------------- */

function showPortalError(message) {
  const loading =
    document.getElementById(
      "portalLoading"
    );

  const portal =
    document.getElementById(
      "employeePortal"
    );

  const error =
    document.getElementById(
      "portalError"
    );

  const errorMessage =
    document.getElementById(
      "portalErrorMessage"
    );

  hideElement(loading);
  hideElement(portal);
  showElement(error);

  if (errorMessage) {
    errorMessage.textContent =
      message ||
      "Please login again using the invitation shared by your organisation.";
  }

  const loginLink =
    document.getElementById(
      "backToEmployeeLogin"
    );

  const campaign =
    getCampaignSlug();

  if (
    loginLink &&
    campaign
  ) {
    loginLink.href =
      `employee-login.html?campaign=${encodeURIComponent(
        campaign
      )}`;
  }
}


/* ---------------------------------------------------------
   RENDER GIFT CARDS
   --------------------------------------------------------- */

function renderGiftOptions(options) {
  const grid =
    document.getElementById(
      "giftEditsGrid"
    );

  if (!grid) {
    return;
  }

  if (
    !Array.isArray(options) ||
    options.length === 0
  ) {
    grid.innerHTML = `
      <div
        style="
          grid-column: 1 / -1;
          text-align: center;
          padding: 60px 20px;
        "
      >
        <span class="eyebrow">
          COMING SOON
        </span>

        <h3
          style="
            font-family: Georgia, serif;
            font-size: 32px;
            font-weight: 400;
            color: #6f263d;
          "
        >
          Your Nazarana is being curated.
        </h3>

        <p
          style="
            color: #756e68;
            line-height: 1.7;
          "
        >
          Please check again shortly.
        </p>
      </div>
    `;

    return;
  }

  grid.innerHTML =
    options
      .map((option, index) => {
        const lifestyleImage =
          option.lifestyle_image_url ||
          placeholderImage(
            "lifestyle"
          );

        return `
          <article
            class="gift-edit-card"
            data-gift-edit-id="${escapeHtml(
              option.gift_edit_id
            )}"
          >

            <img
              class="gift-edit-lifestyle"
              src="${escapeHtml(
                lifestyleImage
              )}"
              alt="${escapeHtml(
                option.name
              )}"
            >

            <div class="gift-edit-body">

              <span class="gift-edit-number">
                Edit ${String(
                  index + 1
                ).padStart(2, "0")}
              </span>

              <h3>
                ${escapeHtml(
                  option.name
                )}
              </h3>

              <p class="gift-edit-tagline">
                ${escapeHtml(
                  option.tagline ||
                  option.employee_copy ||
                  ""
                )}
              </p>

         
              <button
                type="button"
                class="choose-edit-button"
                data-gift-edit-id="${escapeHtml(
                  option.gift_edit_id
                )}"
              >
                Choose this Edit
              </button>

            </div>

          </article>
        `;
      })
      .join("");

  grid
    .querySelectorAll(
      ".choose-edit-button"
    )
    .forEach((button) => {
      button.addEventListener(
        "click",
        () => {
          const id =
            button.dataset.giftEditId;

          const option =
            options.find(
              (item) =>
                item.gift_edit_id === id
            );

          if (option) {
            openSelectionModal(
              option
            );
          }
        }
      );
    });
}


/* ---------------------------------------------------------
   MODAL
   --------------------------------------------------------- */

function openSelectionModal(option) {
  pendingGift = option;

  const modal =
    document.getElementById(
      "selectionModal"
    );

  const preview =
    document.getElementById(
      "modalGiftPreview"
    );

  const message =
    document.getElementById(
      "selectionModalMessage"
    );

  if (!modal || !preview) {
    return;
  }

  if (message) {
    message.textContent = "";
    hideElement(message);
  }

  const hamperImage =
    option.hamper?.image_url ||
    placeholderImage("hamper");

  preview.innerHTML = `
    <img
      src="${escapeHtml(
        hamperImage
      )}"
      alt="${escapeHtml(
        option.name
      )}"
    >

    <h3>
      ${escapeHtml(
        option.name
      )}
    </h3>

    <p>
      ${escapeHtml(
        option.tagline || ""
      )}
    </p>
  `;

  showElement(modal);
  document.body.style.overflow =
    "hidden";
}


function closeSelectionModal() {
  const modal =
    document.getElementById(
      "selectionModal"
    );

  hideElement(modal);

  document.body.style.overflow =
    "";

  pendingGift = null;
}


/* ---------------------------------------------------------
   LOCKED SELECTION
   --------------------------------------------------------- */

function renderLockedSelection(
  selectedGift
) {
  const grid =
    document.getElementById(
      "giftEditsGrid"
    );

  const intro =
    document.querySelector(
      ".edits-intro"
    );

  const complete =
    document.getElementById(
      "selectionComplete"
    );

  const name =
    document.getElementById(
      "selectedEditName"
    );

  const summary =
    document.getElementById(
      "selectedEditSummary"
    );

  hideElement(grid);
  hideElement(intro);
  showElement(complete);

  if (!selectedGift) {
    if (name) {
      name.textContent =
        "Your Nazarana";
    }

    return;
  }

  if (name) {
    name.textContent =
      selectedGift.name ||
      "Your Nazarana";
  }

  if (summary) {
    const image =
      selectedGift.hamper?.image_url ||
      selectedGift.lifestyle_image_url ||
      placeholderImage("hamper");

    summary.innerHTML = `
      <img
        src="${escapeHtml(
          image
        )}"
        alt="${escapeHtml(
          selectedGift.name ||
          "Your Nazarana"
        )}"
      >
    `;
  }
}


/* ---------------------------------------------------------
   LOAD PORTAL
   --------------------------------------------------------- */

async function initialiseEmployeePortal() {
  const portal =
    document.getElementById(
      "employeePortal"
    );

  if (!portal) {
    return;
  }

  const loading =
    document.getElementById(
      "portalLoading"
    );

  const error =
    document.getElementById(
      "portalError"
    );

  const campaignSlug =
    getCampaignSlug();

  const accessToken =
    getAccessToken();

  if (
    !campaignSlug ||
    !accessToken
  ) {
    showPortalError(
      "Your session has expired. Please login again using the link shared by your organisation."
    );

    return;
  }

  hideElement(error);
  showElement(loading);

  try {
    const result =
      await callEmployeeGifts({
        action: "get_portal",
        campaign_slug:
          campaignSlug
      });

    if (!result.success) {
      if (
        result.message
          ?.toLowerCase()
          .includes("session")
      ) {
        clearEmployeeSession();
      }

      showPortalError(
        result.message ||
        "We couldn't prepare your gifting invitation."
      );

      return;
    }

    portalData = result;

    const greeting =
      document.getElementById(
        "portalGreeting"
      );

    const tier =
      document.getElementById(
        "portalTier"
      );

    const deadline =
      document.getElementById(
        "portalDeadline"
      );

    if (greeting) {
      greeting.textContent =
        result.employee?.first_name
          ? `Welcome, ${result.employee.first_name}.`
          : "Welcome.";
    }


    if (deadline) {
      deadline.textContent =
        formatPortalDate(
          result.campaign?.deadline
        );
    }

    hideElement(loading);
    showElement(portal);

    if (
      result.selection_locked
    ) {
      renderLockedSelection(
        result.selected_gift
      );

      return;
    }

    renderGiftOptions(
      result.options || []
    );

  } catch (error) {
    console.error(
      "Portal load error:",
      error
    );

    showPortalError(
      "We couldn't connect to Nazarana right now. Please try again."
    );
  }
}


/* ---------------------------------------------------------
   CONFIRM SELECTION
   --------------------------------------------------------- */

async function confirmGiftSelection() {
  if (!pendingGift) {
    return;
  }

  const button =
    document.getElementById(
      "confirmSelectionButton"
    );

  const message =
    document.getElementById(
      "selectionModalMessage"
    );

  setButtonLoading(
    button,
    true,
    "Confirming..."
  );

  if (message) {
    hideElement(message);
  }

  try {
    const result =
      await callEmployeeGifts({
        action: "select_gift",

        campaign_slug:
          getCampaignSlug(),

        gift_edit_id:
          pendingGift.gift_edit_id
      });

    if (!result.success) {
      if (message) {
        message.textContent =
          result.message ||
          "We couldn't save your selection.";

        showElement(message);
      }

      if (
        result.code ===
        "SELECTION_LOCKED"
      ) {
        closeSelectionModal();

        await initialiseEmployeePortal();
      }

      return;
    }

    const selected =
      result.selection
        ? {
            gift_edit_id:
              result.selection.gift_edit_id,

            name:
              result.selection.gift_edit?.name,

            tagline:
              result.selection.gift_edit?.tagline,

            lifestyle_image_url:
              result.selection.gift_edit
                ?.lifestyle_image_url,

            hamper:
              result.selection.hamper
          }
        : pendingGift;

    closeSelectionModal();

    renderLockedSelection(
      selected
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

  } catch (error) {
    console.error(
      "Selection error:",
      error
    );

    if (message) {
      message.textContent =
        "We couldn't save your selection. Please try again.";

      showElement(message);
    }

  } finally {
    setButtonLoading(
      button,
      false
    );
  }
}


/* ---------------------------------------------------------
   PORTAL EVENTS
   --------------------------------------------------------- */

function initialisePortalEvents() {
  const close =
    document.getElementById(
      "closeSelectionModal"
    );

  const cancel =
    document.getElementById(
      "cancelSelectionButton"
    );

  const confirm =
    document.getElementById(
      "confirmSelectionButton"
    );

  const overlay =
    document.querySelector(
      ".selection-modal-overlay"
    );

  const logout =
    document.getElementById(
      "employeeLogoutButton"
    );

  if (close) {
    close.addEventListener(
      "click",
      closeSelectionModal
    );
  }

  if (cancel) {
    cancel.addEventListener(
      "click",
      closeSelectionModal
    );
  }

  if (overlay) {
    overlay.addEventListener(
      "click",
      closeSelectionModal
    );
  }

  if (confirm) {
    confirm.addEventListener(
      "click",
      confirmGiftSelection
    );
  }

  if (logout) {
    logout.addEventListener(
      "click",
      () => {
        const campaign =
          getCampaignSlug();

        clearEmployeeSession();

        window.location.href =
          campaign
            ? `employee-login.html?campaign=${encodeURIComponent(
                campaign
              )}`
            : "employee-login.html";
      }
    );
  }
}


/* =========================================================
   START EMPLOYEE PORTAL
   ========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {
    initialisePortalEvents();
    initialiseEmployeePortal();
  }
);
