class LinkedInAssistant {
  constructor(options = {}) {
    this.settings = {
      interactionDelayMin: 1800 + Math.floor(Math.random() * 1000),
      interactionDelayMax: 4500 + Math.floor(Math.random() * 1500),
      scrollDelayMin: 1400 + Math.floor(Math.random() * 800),
      scrollDelayMax: 3200 + Math.floor(Math.random() * 1200),
      pageTransitionDelayMin: 4800 + Math.floor(Math.random() * 2000),
      pageTransitionDelayMax: 8400 + Math.floor(Math.random() * 3000),
      maxConnectionRequests: options.maxConnectionRequests || -1,
      sentConnectionRequests: 0,
      addPersonalizedNote: options.addPersonalizedNote ?? Math.random() > 0.4,
      connectionNotes: options.connectionNotes || [
        "Hi {{firstName}}, I noticed we're in the same industry and thought we could connect.",
        "Hey {{firstName}}, I came across your profile and would love to add you to my professional network.",
        "Hello {{firstName}}, I'm expanding my network with professionals like yourself. Let's connect!",
        "Hi {{firstName}}, I'm interested in your work at {{company}} and would like to connect.",
        "Hello {{firstName}}, I see we share some mutual connections. I'd like to connect directly.",
      ],
      mouseMovementSimulation: options.mouseMovementSimulation ?? true,
      randomScrollVariations: options.randomScrollVariations ?? true,
      sessionMaxTime: options.sessionMaxTime || 45 * 60 * 1000,
      takeMicroBreaks: options.takeMicroBreaks ?? true,
      useObfuscatedSelectors: true,
      varyClickPatterns: true,
      mimicHumanTypingSpeed: true,
      adaptivityLevel: options.adaptivityLevel || 0.7,
      learningRate: options.learningRate || 0.05,
      patternRecognition: options.patternRecognition ?? true,
      avoidanceBehavior: true,
      naturalPageNavigation: true,
    };

    this._state = {
      currentPageItems: [],
      currentItemIndex: 0,
      profileNames: [],
      profileCompanies: [],
      profileIndustries: [],
      profileTitles: [],
      sessionStartTime: Date.now(),
      microBreaksTaken: 0,
      lastActivityTimestamp: Date.now(),
      operationInProgress: false,
      currentPageNumber: 1,
      mousePosition: { x: 0, y: 0 },
      successRates: {},
      detectionRiskFactors: {},
      adaptiveTimings: {
        lastDelays: [],
        successPattern: [],
      },
      sessionMetrics: {
        attempts: 0,
        successes: 0,
        failures: 0,
        skipped: 0,
      },
      patternMemory: new Map(),
    };

    this._boundMethods();
    this._initMutationObserver();
    this._initAdaptiveLearning();
  }

  _boundMethods() {
    this.start = this.start.bind(this);
    this.resume = this.resume.bind(this);
    this._processNextItem = this._processNextItem.bind(this);
    this._handleError = this._handleError.bind(this);
  }

  _initMutationObserver() {
    this.observer = new MutationObserver((mutations) => {
      if (!this._state.operationInProgress) return;

      const relevantChanges = mutations.some((mutation) =>
        Array.from(mutation.addedNodes).some((node) => {
          if (node.nodeType !== Node.ELEMENT_NODE) return false;
          return (
            node.querySelector &&
            (node.querySelector('div[role="dialog"]') ||
              node.matches('div[role="dialog"]'))
          );
        })
      );

      if (relevantChanges) {
        setTimeout(
          () => this._processDialogElements(),
          this._getRandomDelay(500, 1200)
        );
      }
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  _initAdaptiveLearning() {
    this._state.adaptiveTimings = {
      interactionDelay: {
        current:
          (this.settings.interactionDelayMin +
            this.settings.interactionDelayMax) /
          2,
        history: [],
        successRate: 0.5,
      },
      scrollDelay: {
        current:
          (this.settings.scrollDelayMin + this.settings.scrollDelayMax) / 2,
        history: [],
        successRate: 0.5,
      },
      pageTransitionDelay: {
        current:
          (this.settings.pageTransitionDelayMin +
            this.settings.pageTransitionDelayMax) /
          2,
        history: [],
        successRate: 0.5,
      },
    };
  }

  _updateAdaptiveTimings(type, success) {
    if (!this.settings.patternRecognition) return;

    const timing = this._state.adaptiveTimings[type];
    if (!timing) return;

    timing.history.push({
      value: timing.current,
      success,
      timestamp: Date.now(),
    });

    if (timing.history.length > 10) {
      timing.history.shift();
    }

    // Calculate success rate from recent history
    const recentEntries = timing.history.slice(-5);
    const successCount = recentEntries.filter((entry) => entry.success).length;
    timing.successRate = successCount / recentEntries.length;

    // Adjust timing based on success rate
    if (timing.successRate < 0.4) {
      // Slower if failing
      timing.current *= 1 + this.settings.learningRate;
    } else if (timing.successRate > 0.8) {
      // Faster if successful
      timing.current *= 1 - this.settings.learningRate * 0.5;
    }

    // Keep within bounds
    const minKey = `${type}Min`;
    const maxKey = `${type}Max`;

    if (this.settings[minKey] && timing.current < this.settings[minKey]) {
      timing.current = this.settings[minKey];
    } else if (
      this.settings[maxKey] &&
      timing.current > this.settings[maxKey]
    ) {
      timing.current = this.settings[maxKey];
    }
  }

  _getRandomDelay(min, max) {
    const baseDelay = Math.floor(Math.random() * (max - min + 1)) + min;
    const variation = Math.floor(Math.random() * (baseDelay * 0.1));
    return baseDelay + (Math.random() > 0.5 ? variation : -variation);
  }

  _getAdaptiveDelay(type) {
    if (!this.settings.patternRecognition) {
      return this._getRandomDelay(
        this.settings[`${type}Min`] || 500,
        this.settings[`${type}Max`] || 2000
      );
    }

    const timing = this._state.adaptiveTimings[type];
    if (!timing) {
      return this._getRandomDelay(1000, 3000);
    }

    // Add human-like variation
    const variation = timing.current * 0.2;
    return timing.current + (Math.random() * variation * 2 - variation);
  }

  async _moveMouseRealisticly(targetElement) {
    if (
      !this.settings.mouseMovementSimulation ||
      !targetElement ||
      !targetElement.getBoundingClientRect
    )
      return;

    try {
      const rect = targetElement.getBoundingClientRect();
      const targetX = rect.left + rect.width / 2 + (Math.random() * 10 - 5);
      const targetY = rect.top + rect.height / 2 + (Math.random() * 10 - 5);
      const startX = this._state.mousePosition.x || window.innerWidth / 2;
      const startY = this._state.mousePosition.y || window.innerHeight / 2;
      const cp1x = startX + (targetX - startX) * (0.2 + Math.random() * 0.2);
      const cp1y = startY + (targetY - startY) * (0.4 + Math.random() * 0.2);
      const cp2x = startX + (targetX - startX) * (0.8 - Math.random() * 0.2);
      const cp2y = startY + (targetY - startY) * (0.8 - Math.random() * 0.2);
      const points = [];
      const steps = 12 + Math.floor(Math.random() * 8);

      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const u = 1 - t;
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

      for (const point of points) {
        this._state.mousePosition = point;
        await this._microDelay(8 + Math.random() * 25);
      }

      await this._microDelay(200 + Math.random() * 300);
    } catch (e) {}
  }

  async _microDelay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async _simulateTyping(element, text) {
    if (!element || !this.settings.mimicHumanTypingSpeed) {
      element.value = text;
      element.dispatchEvent(new Event("input", { bubbles: true }));
      return;
    }

    element.focus();
    if (element.value) {
      element.value = "";
      element.dispatchEvent(new Event("input", { bubbles: true }));
    }

    // Context-aware typing that considers word complexity
    const words = text.split(/\s+/);
    let position = 0;

    for (const word of words) {
      // Type each character with variable speed
      for (let i = 0; i < word.length; i++) {
        const char = word[i];

        // More sophisticated typing speed variation
        let typingDelay;

        // Complex words get slower typing
        const wordComplexity = Math.min(1, word.length / 12);

        if (".,:;!?".includes(char)) {
          typingDelay = 100 + Math.random() * 300;
        } else if ("etaoinshrd".includes(char.toLowerCase())) {
          typingDelay = 40 + Math.random() * 60 * (1 + wordComplexity * 0.5);
        } else {
          typingDelay = 60 + Math.random() * 80 * (1 + wordComplexity * 0.5);
        }

        // Occasional typing error and correction (about 5% chance)
        if (Math.random() < 0.05 && i < word.length - 1) {
          const wrongChar = String.fromCharCode(
            word.charCodeAt(i) + Math.floor(Math.random() * 5) - 2
          );
          element.value += wrongChar;
          element.dispatchEvent(new Event("input", { bubbles: true }));
          await this._microDelay(300 + Math.random() * 400);
          element.value = element.value.slice(0, -1);
          element.dispatchEvent(new Event("input", { bubbles: true }));
          await this._microDelay(200 + Math.random() * 300);
        }

        // Type the correct character
        element.value += char;
        element.dispatchEvent(new Event("input", { bubbles: true }));
        await this._microDelay(typingDelay);
      }

      // Add space between words
      if (position < words.length - 1) {
        element.value += " ";
        element.dispatchEvent(new Event("input", { bubbles: true }));
        await this._microDelay(50 + Math.random() * 100);
      }

      position++;

      // Occasional pause between words (thinking pause)
      if (Math.random() < 0.15) {
        await this._microDelay(300 + Math.random() * 700);
      }
    }

    await this._microDelay(500 + Math.random() * 800);
  }

  async _safeClick(element) {
    if (!element) return false;

    try {
      // Add safety check for element still being in DOM
      if (!document.contains(element)) {
        return false;
      }

      await this._moveMouseRealisticly(element);

      // Enhanced human behavior variations
      if (this.settings.varyClickPatterns) {
        const behaviorChoice = Math.random();

        if (behaviorChoice < 0.3) {
          // Pause before clicking as if considering
          await this._delay(300 + Math.random() * 800);
        } else if (behaviorChoice < 0.5) {
          // Hover behavior before clicking
          element.dispatchEvent(
            new MouseEvent("mouseover", {
              bubbles: true,
              cancelable: true,
              view: window,
            })
          );
          await this._delay(200 + Math.random() * 500);
        } else if (behaviorChoice < 0.6) {
          // Double hesitation pattern
          await this._delay(200 + Math.random() * 300);
          element.dispatchEvent(
            new MouseEvent("mouseover", {
              bubbles: true,
              cancelable: true,
              view: window,
            })
          );
          await this._delay(150 + Math.random() * 250);
          element.dispatchEvent(
            new MouseEvent("mouseout", {
              bubbles: true,
              cancelable: true,
              view: window,
            })
          );
          await this._delay(300 + Math.random() * 400);
          element.dispatchEvent(
            new MouseEvent("mouseover", {
              bubbles: true,
              cancelable: true,
              view: window,
            })
          );
          await this._delay(200 + Math.random() * 300);
        }
      }

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
      console.log("Click error:", error);
      return false;
    }
  }

  _findElement(selectors, parentElement = document) {
    if (!Array.isArray(selectors)) {
      selectors = [selectors];
    }

    // Add dynamic selectors based on context
    const dynamicSelectors = this._generateContextAwareSelectors(parentElement);
    if (dynamicSelectors.length > 0) {
      selectors = [...selectors, ...dynamicSelectors];
    }

    for (const selector of selectors) {
      try {
        if (typeof selector === "string") {
          const elements = Array.from(parentElement.querySelectorAll(selector));
          if (elements.length > 0) {
            if (elements.length > 1 && Math.random() < 0.5) {
              const randomIndex = Math.floor(
                Math.random() * Math.min(3, elements.length)
              );
              return elements[randomIndex];
            }
            return elements[0];
          }
        } else if (typeof selector === "function") {
          const element = selector(parentElement);
          if (element) return element;
        }
      } catch (e) {}
    }

    return null;
  }

  _generateContextAwareSelectors(parentElement) {
    const contextSelectors = [];

    // Learn from successful button clicks
    if (this._state.patternMemory.size > 0) {
      for (const [pattern, success] of this._state.patternMemory.entries()) {
        if (success > 0.7) {
          contextSelectors.push(pattern);
        }
      }
    }

    // Create selectors based on page content
    try {
      const buttonTexts = [
        "connect",
        "add contact",
        "network",
        "add connection",
      ];
      contextSelectors.push((el) => {
        const buttons = Array.from(parentElement.querySelectorAll("button"));
        return buttons.find((btn) => {
          const text = btn.textContent.trim().toLowerCase();
          return (
            buttonTexts.some((btnText) => text.includes(btnText)) &&
            !btn.disabled
          );
        });
      });
    } catch (e) {}

    return contextSelectors;
  }

  _findConnectButtons() {
    const strategies = [
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
      () =>
        Array.from(
          document.querySelectorAll(
            'button[aria-label*="Connect"], button[aria-label*="connect"]'
          )
        ),
      () =>
        Array.from(
          document.querySelectorAll(
            '[data-control-name="connect"], [data-control-name="connection_request"]'
          )
        )
          .map((el) => el.closest("button"))
          .filter(Boolean),
      () => {
        const spans = Array.from(document.querySelectorAll("span")).filter(
          (span) => span.textContent.trim().toLowerCase() === "connect"
        );
        return spans.map((span) => span.closest("button")).filter(Boolean);
      },
      () => {
        const searchResults = document.querySelectorAll(
          ".reusable-search__result-container"
        );
        const buttons = [];
        searchResults.forEach((result) => {
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
      // AI-powered intelligent selector based on page structure analysis
      () => {
        const allButtons = Array.from(document.querySelectorAll("button"));
        return allButtons.filter((btn) => {
          // Use multiple signals to identify connect buttons
          const text = btn.textContent.trim().toLowerCase();
          const hasConnectText = text === "connect";
          const hasRightSize = btn.offsetWidth > 60 && btn.offsetWidth < 150;
          const isInSearchResults = Boolean(btn.closest(".search-results"));
          const isNotMessagingButton = !text.includes("message");

          // Combine signals with weighted scoring
          let score = 0;
          if (hasConnectText) score += 5;
          if (hasRightSize) score += 2;
          if (isInSearchResults) score += 2;
          if (isNotMessagingButton) score += 1;

          return score >= 5;
        });
      },
    ];

    for (const strategy of strategies) {
      try {
        const buttons = strategy();
        if (buttons.length > 0) {
          return buttons;
        }
      } catch (e) {}
    }

    return [];
  }

  _gatherProfileInfo() {
    this._state.profileNames = [];
    this._state.profileCompanies = [];
    this._state.profileIndustries = [];
    this._state.profileTitles = [];

    const searchResults = document.querySelectorAll(
      ".reusable-search__result-container"
    );

    searchResults.forEach((result) => {
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
        name = nameEl.textContent.trim().split(" ")[0];
      }

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
        const companyMatch = companyText.match(/(?:at|@)\s+([^•]+)/i);
        company = companyMatch
          ? companyMatch[1].trim()
          : companyText.split("•")[0].trim();
      }

      // Industry extraction
      let industry = "";
      try {
        const industryEl = this._findElement(
          [".entity-result__secondary-subtitle"],
          result
        );
        if (industryEl) {
          const industryText = industryEl.textContent.trim();
          industry = industryText.split("•")[0].trim();
        }
      } catch (e) {}

      // Job title extraction
      let title = "";
      try {
        if (companyEl) {
          const titleText = companyEl.textContent.trim();
          title = titleText.split(" at ")[0].trim();
        }
      } catch (e) {}

      this._state.profileNames.push(name);
      this._state.profileCompanies.push(company);
      this._state.profileIndustries.push(industry);
      this._state.profileTitles.push(title);
    });
  }

  async _delay(ms) {
    const variationPercent = 0.2;
    const variation = ms * variationPercent;
    const actualDelay = ms + (Math.random() * variation * 2 - variation);
    return new Promise((resolve) => setTimeout(resolve, actualDelay));
  }

  async _naturalScroll() {
    const documentHeight = Math.max(
      document.body.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.clientHeight,
      document.documentElement.scrollHeight,
      document.documentElement.offsetHeight
    );

    if (documentHeight <= window.innerHeight) return;

    const scrollTarget = documentHeight - window.innerHeight;
    let currentPosition =
      window.pageYOffset || document.documentElement.scrollTop;

    // Enhanced scrolling pattern with variable acceleration
    const scrollSegments = 6 + Math.floor(Math.random() * 8);
    const scrollStepBase = scrollTarget / scrollSegments;

    // Realistic scrolling pattern types
    const scrollPatterns = [
      // Smooth continuous scrolling
      async () => {
        for (let i = 0; i < scrollSegments; i++) {
          const scrollStep = scrollStepBase * (0.8 + Math.random() * 0.4);
          const steps = 10 + Math.floor(Math.random() * 5);

          for (let j = 0; j < steps; j++) {
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

          if (this.settings.randomScrollVariations && Math.random() < 0.4) {
            await this._delay(500 + Math.random() * 3000);
          }
        }
      },

      // Quick scroll with pauses
      async () => {
        for (let i = 0; i < 3; i++) {
          const scrollAmt = scrollTarget * (0.3 + i * 0.2);
          window.scrollTo({
            top: scrollAmt,
            behavior: "smooth",
          });
          await this._delay(1200 + Math.random() * 2000);
        }
        // Final scroll
        window.scrollTo({
          top: scrollTarget,
          behavior: "smooth",
        });
      },

      // Irregular scrolling pattern
      async () => {
        let pos = 0;
        while (pos < scrollTarget) {
          const jumpSize = Math.min(
            scrollTarget - pos,
            300 + Math.floor(Math.random() * 700)
          );

          pos += jumpSize;
          window.scrollTo(0, pos);

          await this._delay(200 + Math.random() * 400);

          // Occasional scroll back up slightly
          if (Math.random() < 0.2 && pos > jumpSize * 0.5) {
            const backAmount = Math.floor(jumpSize * 0.2);
            pos -= backAmount;
            window.scrollTo(0, pos);
            await this._delay(500 + Math.random() * 1000);
          }
        }
      },
    ];

    // Choose a random scroll pattern
    const patternIndex = Math.floor(Math.random() * scrollPatterns.length);
    await scrollPatterns[patternIndex]();

    await this._delay(
      this._getRandomDelay(
        this.settings.scrollDelayMin,
        this.settings.scrollDelayMax
      )
    );

    window.scrollTo({ top: 0, behavior: "smooth" });
    await this._delay(1000 + Math.random() * 500);
  }

  async _processDialogElements() {
    try {
      const dialog = this._findElement('div[role="dialog"]');
      if (!dialog) return;

      // Add timeout protection for dialog processing
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Dialog processing timeout")), 30000)
      );

      await Promise.race([this._processDialog(dialog), timeoutPromise]);
    } catch (error) {
      console.log("Dialog processing error:", error);
      // Attempt to recover by closing any open dialogs
      const closeButton = this._findElement([
        'button[aria-label="Dismiss"]',
        'button[aria-label="Close"]',
        'button[aria-label="Cancel"]',
      ]);
      if (closeButton) await this._safeClick(closeButton);
    }
  }

  // New helper method to handle dialog processing
  async _processDialog(dialog) {
    if (this.settings.addPersonalizedNote) {
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
        await this._delay(this._getRandomDelay(800, 1400));

        const textarea = this._findElement(
          ['textarea[name="message"]', "textarea", '[role="textbox"]'],
          dialog
        );

        if (textarea) {
          const currentIndex = this._state.currentItemIndex;
          const firstName = this._state.profileNames[currentIndex] || "there";
          const company = this._state.profileCompanies[currentIndex] || "";
          const industry =
            this._state.profileIndustries[currentIndex] || "professional";
          const title = this._state.profileTitles[currentIndex] || "";

          const noteTemplateIndex = Math.floor(
            Math.random() * this.settings.connectionNotes.length
          );
          let note = this.settings.connectionNotes[noteTemplateIndex];

          note = note.replace(/{{firstName}}/g, firstName);
          note = note.replace(/{{company}}/g, company);
          note = note.replace(/{{industry}}/g, industry);
          note = note.replace(/{{title}}/g, title);

          await this._simulateTyping(textarea, note);
        }
      }
    }

    const sendButton = this._findElement(
      [
        'button[aria-label="Send now"]',
        'button[aria-label="Send invitation"]',
        'button[aria-label="Send without a note"]',
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
      const clickSuccess = await this._safeClick(sendButton);

      if (clickSuccess) {
        this.settings.sentConnectionRequests++;
        this._state.sessionMetrics.successes++;

        // Update adaptive learning
        this._updateAdaptiveTimings("interactionDelay", true);
      } else {
        this._state.sessionMetrics.failures++;
        this._updateAdaptiveTimings("interactionDelay", false);
      }

      await this._delay(this._getRandomDelay(800, 1400));

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

  async _processNextItem() {
    if (this._shouldStopProcessing()) {
      this._finishSession();
      return;
    }

    if (this._state.currentItemIndex >= this._state.currentPageItems.length) {
      await this._goToNextPage();
      return;
    }

    const currentButton =
      this._state.currentPageItems[this._state.currentItemIndex];

    if (
      !currentButton ||
      currentButton.disabled ||
      currentButton.getAttribute("aria-disabled") === "true"
    ) {
      this._state.currentItemIndex++;
      this._state.sessionMetrics.skipped++;
      await this._delay(this._getRandomDelay(500, 1000));
      await this._processNextItem();
      return;
    }

    this._state.sessionMetrics.attempts++;
    await this._safeClick(currentButton);

    this._state.currentItemIndex++;
    await this._delay(
      this._getRandomDelay(
        this.settings.interactionDelayMin,
        this.settings.interactionDelayMax
      )
    );

    if (this.settings.takeMicroBreaks && Math.random() < 0.15) {
      const breakTime = 15000 + Math.random() * 30000;
      this._state.microBreaksTaken++;
      await this._delay(breakTime);
    }

    await this._processNextItem();
  }

  async _goToNextPage() {
    const nextButton = this._findElement([
      'button[aria-label="Next"]',
      "button.artdeco-pagination__button--next",
      (buttonEl) => {
        const text = buttonEl?.textContent?.trim()?.toLowerCase();
        return buttonEl?.tagName === "BUTTON" && text === "next";
      },
      (buttonEl) => {
        return (
          buttonEl?.tagName === "BUTTON" &&
          buttonEl?.querySelector("svg") &&
          buttonEl?.parentElement?.classList.contains("artdeco-pagination")
        );
      },
    ]);

    if (
      !nextButton ||
      nextButton.disabled ||
      nextButton.getAttribute("aria-disabled") === "true"
    ) {
      this._finishSession();
      return;
    }

    await this._safeClick(nextButton);
    this._state.currentPageNumber++;

    await this._delay(
      this._getRandomDelay(
        this.settings.pageTransitionDelayMin,
        this.settings.pageTransitionDelayMax
      )
    );

    await this._initiatePage();
  }

  _shouldStopProcessing() {
    if (
      this.settings.maxConnectionRequests > 0 &&
      this.settings.sentConnectionRequests >=
        this.settings.maxConnectionRequests
    ) {
      return true;
    }

    if (
      Date.now() - this._state.sessionStartTime >
      this.settings.sessionMaxTime
    ) {
      return true;
    }

    return false;
  }

  _finishSession() {
    this._state.operationInProgress = false;
    const sessionDuration = Math.round(
      (Date.now() - this._state.sessionStartTime) / 1000
    );

    // Fix syntax error: Changed "if this.observer" to proper if statement
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null; // Prevent memory leak
    }

    // Log session metrics
    console.log("===== Session Complete =====");
    console.log(`Requests sent: ${this.settings.sentConnectionRequests}`);
    console.log(`Pages processed: ${this._state.currentPageNumber}`);
    console.log(
      `Success rate: ${(
        (this._state.sessionMetrics.successes /
          this._state.sessionMetrics.attempts) *
        100
      ).toFixed(1)}%`
    );
    console.log(`Failures: ${this._state.sessionMetrics.failures}`);
    console.log(`Skipped: ${this._state.sessionMetrics.skipped}`);
    console.log(
      `Duration: ${Math.floor(sessionDuration / 60)}m ${sessionDuration % 60}s`
    );
  }

  _handleError(error) {
    console.log("An error occurred:", error);
    this._state.operationInProgress = false;

    // Clean up resources
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    // Reset state
    this._state.currentPageItems = [];
    this._state.currentItemIndex = 0;

    // Update metrics
    this._state.sessionMetrics.failures++;
  }

  async resume() {
    if (this._state.operationInProgress) {
      return;
    }

    this._state.operationInProgress = true;

    try {
      await this._initiatePage();
    } catch (error) {
      this._handleError(error);
    }
  }

  async _initiatePage() {
    try {
      if (!this._state.operationInProgress) return;

      await this._naturalScroll();

      // Add safety check for page load
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const buttons = this._findConnectButtons();
      if (!Array.isArray(buttons)) {
        throw new Error("Failed to find connect buttons");
      }

      this._state.currentPageItems = buttons;
      this._state.currentItemIndex = 0;

      this._gatherProfileInfo();

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

      await this._processNextItem();
    } catch (error) {
      console.log("Page initiation error:", error);
      this._handleError(error);
    }
  }

  async start() {
    if (!window.location.href.includes("linkedin.com/search/results/people")) {
      return;
    }

    this._state.sessionStartTime = Date.now();
    this._state.microBreaksTaken = 0;
    this._state.lastActivityTimestamp = Date.now();
    this._state.operationInProgress = true;
    this._state.currentPageNumber = 1;

    try {
      await this._initiatePage();
    } catch (error) {
      this._handleError(error);
    }
  }

  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
  }

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
