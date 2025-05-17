class LinkedInAssistant {
  constructor(options = {}) {
    // Default configuration with human-like timing variations
    this.settings = {
      // Variable wait times with wider ranges to mimic human behavior
      interactionDelayMin: 1800 + Math.floor(Math.random() * 1000),
      interactionDelayMax: 4500 + Math.floor(Math.random() * 1500),
      scrollDelayMin: 1400 + Math.floor(Math.random() * 800),
      scrollDelayMax: 3200 + Math.floor(Math.random() * 1200),
      pageTransitionDelayMin: 4800 + Math.floor(Math.random() * 2000),
      pageTransitionDelayMax: 8400 + Math.floor(Math.random() * 3000),

      // Connection settings
      maxConnectionRequests: options.maxConnectionRequests || -1, // -1 means unlimited
      sentConnectionRequests: 0,
      addPersonalizedNote: options.addPersonalizedNote ?? Math.random() > 0.4, // Randomize by default

      // Message templates (multiple variations for natural appearance)
      connectionNotes: options.connectionNotes || [
        "Hi {{firstName}}, I noticed we're in the same industry and thought we could connect.",
        "Hey {{firstName}}, I came across your profile and would love to add you to my professional network.",
        "Hello {{firstName}}, I'm expanding my network with professionals like yourself. Let's connect!",
        "Hi {{firstName}}, I'm interested in your work at {{company}} and would like to connect.",
        "Hello {{firstName}}, I see we share some mutual connections. I'd like to connect directly.",
      ],

      // Advanced options
      mouseMovementSimulation: options.mouseMovementSimulation ?? true,
      randomScrollVariations: options.randomScrollVariations ?? true,
      sessionMaxTime: options.sessionMaxTime || 45 * 60 * 1000, // 45 minutes default
      takeMicroBreaks: options.takeMicroBreaks ?? true,

      // Detection avoidance
      useObfuscatedSelectors: true,
      varyClickPatterns: true,
      mimicHumanTypingSpeed: true,
    };

    // Internal state tracking
    this._state = {
      currentPageItems: [],
      currentItemIndex: 0,
      profileNames: [],
      profileCompanies: [],
      sessionStartTime: Date.now(),
      microBreaksTaken: 0,
      lastActivityTimestamp: Date.now(),
      operationInProgress: false,
      currentPageNumber: 1,
      mousePosition: { x: 0, y: 0 },
    };

    // Bind methods to maintain context
    this._boundMethods();

    // Initialize mutation observer for dynamic content
    this._initMutationObserver();
  }

  _boundMethods() {
    this.start = this.start.bind(this);
    this.resume = this.resume.bind(this);
    this._processNextItem = this._processNextItem.bind(this);
    this._handleError = this._handleError.bind(this);
  }

  _initMutationObserver() {
    // Monitor DOM changes to detect LinkedIn's dynamic content updates
    this.observer = new MutationObserver(this._handleDOMChanges.bind(this));
    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  _handleDOMChanges(mutations) {
    // Only process relevant mutations when in certain states
    if (!this._state.operationInProgress) return;

    // Check for specific LinkedIn elements appearing/changing
    const relevantChanges = mutations.some((mutation) => {
      // Look for connection modal or success feedback elements
      return Array.from(mutation.addedNodes).some((node) => {
        if (node.nodeType !== Node.ELEMENT_NODE) return false;

        // Check for connection dialog or status changes
        const isConnectionDialog =
          node.querySelector &&
          (node.querySelector('div[role="dialog"]') ||
            node.matches('div[role="dialog"]'));

        return isConnectionDialog;
      });
    });

    if (relevantChanges) {
      // Handle newly appeared elements after a short delay
      setTimeout(
        () => this._processDialogElements(),
        this._getRandomDelay(500, 1200)
      );
    }
  }

  /**
   * Generate a random delay within specified range
   */
  _getRandomDelay(min, max) {
    // Add slight variation for unpredictability
    const baseDelay = Math.floor(Math.random() * (max - min + 1)) + min;
    const variation = Math.floor(Math.random() * (baseDelay * 0.1));
    return baseDelay + (Math.random() > 0.5 ? variation : -variation);
  }

  /**
   * Generate realistic mouse movement
   */
  async _moveMouseRealisticly(targetElement) {
    if (!this.settings.mouseMovementSimulation) return;

    // Only enabled in environments that support this (not all browsers)
    if (!targetElement || !targetElement.getBoundingClientRect) return;

    try {
      const rect = targetElement.getBoundingClientRect();
      const targetX = rect.left + rect.width / 2 + (Math.random() * 10 - 5);
      const targetY = rect.top + rect.height / 2 + (Math.random() * 10 - 5);

      // Starting position (current mouse position or a reasonable default)
      const startX = this._state.mousePosition.x || window.innerWidth / 2;
      const startY = this._state.mousePosition.y || window.innerHeight / 2;

      // Bezier curve control points for natural mouse movement
      const cp1x = startX + (targetX - startX) * (0.2 + Math.random() * 0.2);
      const cp1y = startY + (targetY - startY) * (0.4 + Math.random() * 0.2);
      const cp2x = startX + (targetX - startX) * (0.8 - Math.random() * 0.2);
      const cp2y = startY + (targetY - startY) * (0.8 - Math.random() * 0.2);

      // Create points along the curve for movement
      const points = [];
      const steps = 12 + Math.floor(Math.random() * 8);

      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const u = 1 - t;

        // Cubic Bezier formula
        const x =
          u * u * u * startX +
          3 * u * u * t * cp1x +
          3 * u * t * t * cp2x +
          t * t * t * targetX;
        const y =
          u * u * u * startY +
          3 * u * u * t * cp1y +
          3 * u * t * t * cp2y +
          t * t * t * targetY;

        points.push({ x, y });
      }

      // Move along the path with natural timing
      for (const point of points) {
        this._state.mousePosition = point;
        // In a real implementation, we would dispatch mouse events
        // But we'll simulate this by updating state and adding delays
        await this._microDelay(8 + Math.random() * 25);
      }

      // Add a small pause before clicking, like a human would
      await this._microDelay(200 + Math.random() * 300);
    } catch (e) {
      // Fail silently if mouse movement simulation encounters an error
    }
  }

  async _microDelay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Simulates realistic typing for personalized notes
   */
  async _simulateTyping(element, text) {
    if (!element || !this.settings.mimicHumanTypingSpeed) {
      // Fallback to direct assignment if typing simulation not enabled
      element.value = text;
      element.dispatchEvent(new Event("input", { bubbles: true }));
      return;
    }

    element.focus();
    // Clear any existing value if needed
    if (element.value) {
      element.value = "";
      element.dispatchEvent(new Event("input", { bubbles: true }));
    }

    // Type character by character with variable speed
    for (let i = 0; i < text.length; i++) {
      // Typing speed varies based on character and position
      let typingDelay;

      const char = text[i];

      // Pauses at punctuation
      if (".,:;!?".includes(char)) {
        typingDelay = 100 + Math.random() * 300;
      }
      // Faster for common characters
      else if ("etaoinshrd".includes(char.toLowerCase())) {
        typingDelay = 40 + Math.random() * 60;
      }
      // Normal speed for other characters
      else {
        typingDelay = 60 + Math.random() * 80;
      }

      // Occasional typing error and correction (about 5% chance)
      if (Math.random() < 0.05 && i < text.length - 1) {
        // Type a wrong character
        const wrongChar = String.fromCharCode(
          text.charCodeAt(i) + Math.floor(Math.random() * 5) - 2
        );

        element.value += wrongChar;
        element.dispatchEvent(new Event("input", { bubbles: true }));

        // Brief pause before correcting
        await this._microDelay(300 + Math.random() * 400);

        // Delete the wrong character
        element.value = element.value.slice(0, -1);
        element.dispatchEvent(new Event("input", { bubbles: true }));

        // Pause before continuing
        await this._microDelay(200 + Math.random() * 300);
      }

      // Type the correct character
      element.value += text[i];
      element.dispatchEvent(new Event("input", { bubbles: true }));

      await this._microDelay(typingDelay);
    }

    // Pause after finishing typing
    await this._microDelay(500 + Math.random() * 800);
  }

  /**
   * Safely performs a click with human-like timing and behavior
   */
  async _safeClick(element) {
    if (!element) return false;

    try {
      // Random variation in exactly where the click happens within the element
      await this._moveMouseRealisticly(element);

      // Sometimes we do a sequence of actions before clicking (human behavior)
      if (this.settings.varyClickPatterns && Math.random() < 0.3) {
        // Pause before clicking as if considering
        await this._delay(300 + Math.random() * 800);

        // Occasional hover behavior before clicking
        if (Math.random() < 0.4) {
          element.dispatchEvent(
            new MouseEvent("mouseover", {
              bubbles: true,
              cancelable: true,
              view: window,
            })
          );

          await this._delay(200 + Math.random() * 500);
        }
      }

      // Use a direct click rather than .click() to avoid detection
      const clickEvent = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        view: window,
        clientX: this._state.mousePosition.x,
        clientY: this._state.mousePosition.y,
      });

      element.dispatchEvent(clickEvent);
      this._state.lastActivityTimestamp = Date.now();
      return true;
    } catch (error) {
      console.log(
        "Interaction issue encountered, retrying with alternative method"
      );

      // Fallback method
      try {
        element.click();
        this._state.lastActivityTimestamp = Date.now();
        return true;
      } catch (e) {
        return false;
      }
    }
  }

  /**
   * Smart selector strategy that uses multiple approaches to find elements
   */
  _findElement(selectors, parentElement = document) {
    // Try multiple selectors in order of preference
    if (!Array.isArray(selectors)) {
      selectors = [selectors];
    }

    for (const selector of selectors) {
      try {
        // For simple string selectors
        if (typeof selector === "string") {
          const elements = Array.from(parentElement.querySelectorAll(selector));
          if (elements.length > 0) {
            // Small randomization if multiple elements match
            if (elements.length > 1 && Math.random() < 0.5) {
              // Occasionally select a different element than the first
              const randomIndex = Math.floor(
                Math.random() * Math.min(3, elements.length)
              );
              return elements[randomIndex];
            }
            return elements[0];
          }
        }
        // For functions that implement custom selection logic
        else if (typeof selector === "function") {
          const element = selector(parentElement);
          if (element) return element;
        }
      } catch (e) {
        // Silently continue to next selector on error
      }
    }

    return null;
  }

  /**
   * Find all connect buttons using various strategies
   */
  _findConnectButtons() {
    // Multiple strategies to find connect buttons
    const strategies = [
      // Strategy 1: Default selector
      () =>
        Array.from(
          document.querySelectorAll(".search-results-container button")
        ).filter((btn) => {
          const text = btn.textContent.trim().toLowerCase();
          return (
            text === "connect" &&
            !btn.closest('[data-live-test="premium-upsell"]')
          );
        }),

      // Strategy 2: Using aria-label
      () =>
        Array.from(
          document.querySelectorAll(
            'button[aria-label*="Connect"], button[aria-label*="connect"]'
          )
        ),

      // Strategy 3: Using data attributes
      () =>
        Array.from(
          document.querySelectorAll(
            '[data-control-name="connect"], [data-control-name="connection_request"]'
          )
        )
          .map((el) => el.closest("button"))
          .filter(Boolean),

      // Strategy 4: Text content with span wrapper
      () => {
        const spans = Array.from(document.querySelectorAll("span")).filter(
          (span) => span.textContent.trim().toLowerCase() === "connect"
        );
        return spans.map((span) => span.closest("button")).filter(Boolean);
      },

      // Strategy 5: Search for connection buttons in search results
      () => {
        const searchResults = document.querySelectorAll(
          ".reusable-search__result-container"
        );
        const buttons = [];
        searchResults.forEach((result) => {
          // Find buttons within this search result
          const resultButtons = Array.from(
            result.querySelectorAll("button")
          ).filter((btn) => {
            const btnText = btn.textContent.trim().toLowerCase();
            return btnText === "connect";
          });
          if (resultButtons.length > 0) {
            buttons.push(resultButtons[0]);
          }
        });
        return buttons;
      },
    ];

    // Try each strategy until we find buttons
    for (const strategy of strategies) {
      try {
        const buttons = strategy();
        if (buttons.length > 0) {
          return buttons;
        }
      } catch (e) {
        // Continue to next strategy on error
      }
    }

    return [];
  }

  /**
   * Gets profile information for personalizing connection notes
   */
  _gatherProfileInfo() {
    this._state.profileNames = [];
    this._state.profileCompanies = [];

    // Look for profile names in search results
    const searchResults = document.querySelectorAll(
      ".reusable-search__result-container"
    );

    searchResults.forEach((result) => {
      // Find name
      let name = "";
      const nameEl = this._findElement(
        [
          '.entity-result__title-text a span[aria-hidden="true"]',
          ".entity-result__title-text a",
          '.search-result__result-title a span[aria-hidden="true"]',
          'a[data-control-name="search_srp_result"] span[aria-hidden="true"]',
        ],
        result
      );

      if (nameEl) {
        name = nameEl.textContent.trim().split(" ")[0]; // Get first name
      }

      // Find company
      let company = "";
      const companyEl = this._findElement(
        [
          ".entity-result__primary-subtitle",
          ".search-result__subtitle",
          'a[data-control-name="search_srp_result"] + div',
        ],
        result
      );

      if (companyEl) {
        const companyText = companyEl.textContent.trim();
        // Extract company name from text that might contain other info
        const companyMatch = companyText.match(/(?:at|@)\s+([^•]+)/i);
        company = companyMatch
          ? companyMatch[1].trim()
          : companyText.split("•")[0].trim();
      }

      this._state.profileNames.push(name);
      this._state.profileCompanies.push(company);
    });
  }

  /**
   * Delay function with human-like variation
   */
  async _delay(ms) {
    // Add variation to the delay to appear more human-like
    const variationPercent = 0.2; // 20% variation
    const variation = ms * variationPercent;
    const actualDelay = ms + (Math.random() * variation * 2 - variation);

    return new Promise((resolve) => setTimeout(resolve, actualDelay));
  }

  /**
   * Natural scrolling with variable speed and occasional pauses
   */
  async _naturalScroll() {
    const documentHeight = Math.max(
      document.body.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.clientHeight,
      document.documentElement.scrollHeight,
      document.documentElement.offsetHeight
    );

    // Don't scroll if there's nothing to scroll
    if (documentHeight <= window.innerHeight) return;

    const scrollTarget = documentHeight - window.innerHeight;
    let currentPosition =
      window.pageYOffset || document.documentElement.scrollTop;

    // Randomize scroll parameters for natural appearance
    const scrollSegments = 6 + Math.floor(Math.random() * 8);
    const scrollStepBase = scrollTarget / scrollSegments;

    for (let i = 0; i < scrollSegments; i++) {
      // Variable scroll step size
      const scrollStep = scrollStepBase * (0.8 + Math.random() * 0.4);

      // Scroll with natural acceleration/deceleration
      const steps = 10 + Math.floor(Math.random() * 5);

      for (let j = 0; j < steps; j++) {
        // Ease-in/ease-out curve
        const progress = j / steps;
        const ease =
          progress < 0.5
            ? 2 * progress * progress
            : -1 + (4 - 2 * progress) * progress;

        const moveDist = scrollStep * ease;
        currentPosition += moveDist;

        window.scrollTo(0, currentPosition);
        await this._microDelay(10 + Math.random() * 20);
      }

      // Occasional pause while scrolling as if reading content
      if (this.settings.randomScrollVariations && Math.random() < 0.4) {
        await this._delay(500 + Math.random() * 3000);
      }
    }

    // Return to top with a pause first
    await this._delay(
      this._getRandomDelay(
        this.settings.scrollDelayMin,
        this.settings.scrollDelayMax
      )
    );

    // Smooth scroll back to top
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Wait for scrolling to complete
    await this._delay(1000 + Math.random() * 500);
  }

  /**
   * Process connection dialog elements (notes, send buttons)
   */
  async _processDialogElements() {
    // Find the dialog that should be open now
    const dialog = this._findElement('div[role="dialog"]');
    if (!dialog) return;

    // Check if we need to add a note
    if (this.settings.addPersonalizedNote) {
      // Find the "Add a note" button if it exists
      const addNoteButton = this._findElement(
        [
          'button[aria-label="Add a note"]',
          'button:not([disabled]):not([aria-busy="true"]):not([aria-pressed="true"])',
          (buttonEl) => {
            const text = buttonEl?.textContent?.trim()?.toLowerCase();
            return buttonEl?.tagName === "BUTTON" && text === "add a note";
          },
        ],
        dialog
      );

      if (addNoteButton) {
        await this._delay(this._getRandomDelay(800, 1600));
        await this._safeClick(addNoteButton);

        // Wait for note textarea to appear
        await this._delay(this._getRandomDelay(800, 1400));

        // Find the textarea for the note
        const textarea = this._findElement(
          ['textarea[name="message"]', "textarea", '[role="textbox"]'],
          dialog
        );

        if (textarea) {
          // Generate personalized note
          const currentIndex = this._state.currentItemIndex;
          const firstName = this._state.profileNames[currentIndex] || "there";
          const company = this._state.profileCompanies[currentIndex] || "";

          // Select a random note template
          const noteTemplateIndex = Math.floor(
            Math.random() * this.settings.connectionNotes.length
          );
          let note = this.settings.connectionNotes[noteTemplateIndex];

          // Personalize the note
          note = note.replace(/{{firstName}}/g, firstName);
          note = note.replace(/{{company}}/g, company);

          // Simulate human typing
          await this._simulateTyping(textarea, note);
        }
      }
    }

    // Find the send button - use multiple strategies
    const sendButton = this._findElement(
      [
        'button[aria-label="Send now"]',
        'button[aria-label="Send invitation"]',
        'button[aria-label="Send without a note"]',
        // Look for buttons with "send" text regardless of case
        (buttonEl) => {
          const text = buttonEl?.textContent?.trim()?.toLowerCase();
          return (
            buttonEl?.tagName === "BUTTON" &&
            (text === "send" || text === "send now" || text.includes("connect"))
          );
        },
      ],
      dialog
    );

    if (sendButton) {
      await this._delay(this._getRandomDelay(700, 1500));
      await this._safeClick(sendButton);
      this.settings.sentConnectionRequests++;

      // Wait for send confirmation
      await this._delay(this._getRandomDelay(800, 1400));

      // Find and click the dismiss button if it exists
      const dismissButton = this._findElement([
        'button[aria-label="Dismiss"]',
        'button[aria-label="Close"]',
        (buttonEl) => {
          const text = buttonEl?.textContent?.trim()?.toLowerCase();
          return (
            buttonEl?.tagName === "BUTTON" &&
            (text === "got it" || text === "done" || text === "dismiss")
          );
        },
      ]);

      if (dismissButton) {
        await this._delay(this._getRandomDelay(600, 1200));
        await this._safeClick(dismissButton);
        await this._delay(this._getRandomDelay(500, 1200));
      }
    } else {
      // If no send button found, try to close any open dialog to avoid getting stuck
      const closeButton = this._findElement(
        [
          'button[aria-label="Dismiss"]',
          'button[aria-label="Cancel"]',
          'button[aria-label="Close"]',
        ],
        dialog
      );

      if (closeButton) {
        await this._delay(this._getRandomDelay(500, 1000));
        await this._safeClick(closeButton);
      }
    }
  }

  /**
   * Process the next profile in the search results
   */
  async _processNextItem() {
    // Check if we've reached any limits
    if (this._shouldStopProcessing()) {
      this._finishSession();
      return;
    }

    // If we've processed all items on this page, go to the next page
    if (this._state.currentItemIndex >= this._state.currentPageItems.length) {
      await this._goToNextPage();
      return;
    }

    // Get the current connect button
    const currentButton =
      this._state.currentPageItems[this._state.currentItemIndex];

    // Skip if button doesn't exist or isn't clickable
    if (
      !currentButton ||
      currentButton.disabled ||
      currentButton.getAttribute("aria-disabled") === "true"
    ) {
      this._state.currentItemIndex++;
      await this._delay(this._getRandomDelay(500, 1000));
      await this._processNextItem();
      return;
    }

    // Click the connect button
    await this._safeClick(currentButton);

    // The mutation observer will detect the dialog and call _processDialogElements

    // Move to next item after a delay
    this._state.currentItemIndex++;
    await this._delay(
      this._getRandomDelay(
        this.settings.interactionDelayMin,
        this.settings.interactionDelayMax
      )
    );

    // Occasionally take a micro-break to appear human-like
    if (this.settings.takeMicroBreaks && Math.random() < 0.15) {
      const breakTime = 15000 + Math.random() * 30000; // 15-45 second break
      console.log(
        `Taking a short break (${Math.round(
          breakTime / 1000
        )}s) to appear more human-like`
      );
      this._state.microBreaksTaken++;
      await this._delay(breakTime);
    }

    // Process the next item
    await this._processNextItem();
  }

  /**
   * Navigate to the next page of search results
   */
  async _goToNextPage() {
    // Find the next page button using various strategies
    const nextButton = this._findElement([
      'button[aria-label="Next"]',
      "button.artdeco-pagination__button--next",
      // Look for pagination buttons with "next" text
      (buttonEl) => {
        const text = buttonEl?.textContent?.trim()?.toLowerCase();
        return buttonEl?.tagName === "BUTTON" && text === "next";
      },
      // Look for right arrow in pagination
      (buttonEl) => {
        return (
          buttonEl?.tagName === "BUTTON" &&
          buttonEl?.querySelector("svg") &&
          buttonEl?.parentElement?.classList.contains("artdeco-pagination")
        );
      },
    ]);

    // If there's no next button or it's disabled, we're done
    if (
      !nextButton ||
      nextButton.disabled ||
      nextButton.getAttribute("aria-disabled") === "true"
    ) {
      console.log("Reached the end of search results");
      this._finishSession();
      return;
    }

    // Click the next button
    await this._safeClick(nextButton);
    this._state.currentPageNumber++;

    // Wait for page transition
    await this._delay(
      this._getRandomDelay(
        this.settings.pageTransitionDelayMin,
        this.settings.pageTransitionDelayMax
      )
    );

    // Restart process on new page
    await this._initiatePage();
  }

  /**
   * Check if we should stop processing
   */
  _shouldStopProcessing() {
    // Check if we've reached the maximum number of requests
    if (
      this.settings.maxConnectionRequests > 0 &&
      this.settings.sentConnectionRequests >=
        this.settings.maxConnectionRequests
    ) {
      console.log(
        `Reached maximum connection requests: ${this.settings.maxConnectionRequests}`
      );
      return true;
    }

    // Check if the session has been running too long
    if (
      Date.now() - this._state.sessionStartTime >
      this.settings.sessionMaxTime
    ) {
      console.log(
        `Session exceeded maximum time of ${
          this.settings.sessionMaxTime / 60000
        } minutes`
      );
      return true;
    }

    return false;
  }

  /**
   * Finish the session and report statistics
   */
  _finishSession() {
    this._state.operationInProgress = false;
    const sessionDuration = Math.round(
      (Date.now() - this._state.sessionStartTime) / 1000
    );

    console.log("===== LinkedIn Connection Assistant - Session Complete =====");
    console.log(
      `Connection requests sent: ${this.settings.sentConnectionRequests}`
    );
    console.log(`Pages processed: ${this._state.currentPageNumber}`);
    console.log(
      `Session duration: ${Math.floor(sessionDuration / 60)}m ${
        sessionDuration % 60
      }s`
    );
    console.log(`Micro-breaks taken: ${this._state.microBreaksTaken}`);

    // Dispose of the observer
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  /**
   * Handle any errors during processing
   */
  _handleError(error) {
    console.log("An error occurred:", error);

    // Reset the operation state
    this._state.operationInProgress = false;

    // Provide resume capability
    console.log("You can resume by calling the 'resume' method");
  }

  /**
   * Resume the assistant after an error or pause
   */
  async resume() {
    if (this._state.operationInProgress) {
      console.log("Operation already in progress");
      return;
    }

    console.log("Resuming LinkedIn Connection Assistant...");
    this._state.operationInProgress = true;

    try {
      await this._initiatePage();
    } catch (error) {
      this._handleError(error);
    }
  }

  /**
   * Initialize processing on the current page
   */
  async _initiatePage() {
    await this._naturalScroll();

    // Gather connect buttons on the page
    this._state.currentPageItems = this._findConnectButtons();
    this._state.currentItemIndex = 0;

    console.log(
      `Found ${this._state.currentPageItems.length} potential connections on page ${this._state.currentPageNumber}`
    );

    // Gather profile information for personalization
    this._gatherProfileInfo();

    // If no connect buttons found, try to go to next page
    if (this._state.currentPageItems.length === 0) {
      await this._delay(
        this._getRandomDelay(
          this.settings.interactionDelayMin,
          this.settings.interactionDelayMax
        )
      );
      await this._goToNextPage();
      return;
    }

    // Start processing the items
    await this._processNextItem();
  }

  /**
   * Start the LinkedIn Connection Assistant
   */
  async start() {
    // Verify we're on the correct page
    if (!window.location.href.includes("linkedin.com/search/results/people")) {
      console.log("Please navigate to LinkedIn's People Search page first");
      console.log("https://www.linkedin.com/search/results/people");
      return;
    }

    console.log("===== LinkedIn Connection Assistant =====");
    console.log("Starting connection process...");

    // Reset session state
    this._state.sessionStartTime = Date.now();
    this._state.microBreaksTaken = 0;
    this._state.lastActivityTimestamp = Date.now();
    this._state.operationInProgress = true;
    this._state.currentPageNumber = 1;

    try {
      // Start processing the current page
      await this._initiatePage();
    } catch (error) {
      this._handleError(error);
    }
  }

  /**
   * Update settings for the connection assistant
   */
  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    console.log("Settings updated");
  }

  /**
   * Get current statistics about the session
   */
  getStats() {
    const sessionDuration = Math.round(
      (Date.now() - this._state.sessionStartTime) / 1000
    );

    return {
      connectionRequestsSent: this.settings.sentConnectionRequests,
      pagesProcessed: this._state.currentPageNumber,
      sessionDuration: `${Math.floor(sessionDuration / 60)}m ${
        sessionDuration % 60
      }s`,
      microBreaksTaken: this._state.microBreaksTaken,
      isActive: this._state.operationInProgress,
    };
  }
}
