# LinkedIn Assistant

## Overview

LinkedIn Assistant is an open-source automation tool designed to simulate human-like interactions with LinkedIn's search results and connection requests. It employs sophisticated techniques to mimic natural human behavior when sending connection requests, including realistic mouse movements, variable typing speeds, and adaptive timing patterns.

## Features

- **Human-like Interaction**: Simulates natural mouse movements, clicking patterns, and typing behavior
- **Adaptive Learning**: Adjusts interaction timings based on success patterns
- **Personalized Connection Notes**: Customizable templates with dynamic substitution of profile information
- **Anti-Detection Measures**: Implements various techniques to avoid automated behavior detection
- **Session Management**: Controls the number of requests and session duration
- **Performance Metrics**: Tracks success rates and interaction statistics

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [Core Components](#core-components)
- [Methods](#methods)
- [Behavioral Patterns](#behavioral-patterns)
- [Adaptive Learning](#adaptive-learning)
- [Best Practices](#best-practices)
- [Limitations](#limitations)
- [License](#license)

## Installation

LinkedIn Assistant is a JavaScript class that can be used in a browser environment. You can include it in your project or use it directly in your browser's console.

```javascript
// Create an instance of the assistant
const assistant = new LinkedInAssistant({
  maxConnectionRequests: 20,
  addPersonalizedNote: true,
});
```

## Usage

### Basic Usage

```javascript
// Navigate to LinkedIn people search results page
// https://www.linkedin.com/search/results/people/

// Start the assistant
assistant.start();

// To pause and resume
// assistant.resume();

// To get statistics
const stats = assistant.getStats();
console.log(stats);
```

### Custom Settings

```javascript
const assistant = new LinkedInAssistant({
  maxConnectionRequests: 15,
  addPersonalizedNote: true,
  connectionNotes: [
    "Hi {{firstName}}, I noticed your work at {{company}} and would love to connect.",
    "Hello {{firstName}}, I'm expanding my network in the {{industry}} industry. Let's connect!",
  ],
  sessionMaxTime: 30 * 60 * 1000, // 30 minutes
});

// Update settings after creation
assistant.updateSettings({
  interactionDelayMin: 2000,
  interactionDelayMax: 5000,
});
```

## Configuration

The `LinkedInAssistant` constructor accepts an options object with the following properties:

| Property                  | Type    | Default                     | Description                                                |
| ------------------------- | ------- | --------------------------- | ---------------------------------------------------------- |
| `maxConnectionRequests`   | Number  | -1 (unlimited)              | Maximum number of connection requests to send              |
| `addPersonalizedNote`     | Boolean | 60% chance of true          | Whether to add a personalized note to connection requests  |
| `connectionNotes`         | Array   | [5 default templates]       | Templates for personalized notes with placeholders         |
| `mouseMovementSimulation` | Boolean | true                        | Simulates realistic mouse movements                        |
| `randomScrollVariations`  | Boolean | true                        | Adds random variations to scrolling patterns               |
| `sessionMaxTime`          | Number  | 45 _ 60 _ 1000 (45 minutes) | Maximum session duration in milliseconds                   |
| `takeMicroBreaks`         | Boolean | true                        | Takes random short breaks during the session               |
| `adaptivityLevel`         | Number  | 0.7                         | Level of adaptivity for timing adjustments (0-1)           |
| `learningRate`            | Number  | 0.05                        | Rate at which the assistant learns from successes/failures |
| `patternRecognition`      | Boolean | true                        | Enables pattern recognition for adaptive timing            |

### Advanced Timing Settings

| Property                 | Type   | Default     | Description                             |
| ------------------------ | ------ | ----------- | --------------------------------------- |
| `interactionDelayMin`    | Number | ~1800-2800  | Minimum delay between interactions (ms) |
| `interactionDelayMax`    | Number | ~4500-6000  | Maximum delay between interactions (ms) |
| `scrollDelayMin`         | Number | ~1400-2200  | Minimum delay for scrolling (ms)        |
| `scrollDelayMax`         | Number | ~3200-4400  | Maximum delay for scrolling (ms)        |
| `pageTransitionDelayMin` | Number | ~4800-6800  | Minimum delay for page transitions (ms) |
| `pageTransitionDelayMax` | Number | ~8400-11400 | Maximum delay for page transitions (ms) |

## Core Components

### State Management

The assistant maintains an internal state object (`_state`) that tracks:

- Current page items and processing index
- Profile information for personalization
- Session metrics (success rates, attempts, etc.)
- Timing patterns and adaptive learning data
- Mouse position and movement history

### Connection Notes Personalization

Connection notes support the following dynamic placeholders:

- `{{firstName}}`: The first name of the profile
- `{{company}}`: The company name from the profile
- `{{industry}}`: The industry from the profile
- `{{title}}`: The job title from the profile

## Methods

### Public Methods

| Method                        | Description                                                      |
| ----------------------------- | ---------------------------------------------------------------- |
| `start()`                     | Starts the assistant on the current LinkedIn search results page |
| `resume()`                    | Resumes operation after stopping                                 |
| `updateSettings(newSettings)` | Updates the assistant's settings                                 |
| `getStats()`                  | Returns current statistics about the session                     |

### Key Internal Methods

| Method                                 | Description                                               |
| -------------------------------------- | --------------------------------------------------------- |
| `_initiatePage()`                      | Prepares a search results page for processing             |
| `_processNextItem()`                   | Processes the next connection button in the queue         |
| `_naturalScroll()`                     | Performs natural, human-like scrolling through the page   |
| `_simulateTyping(element, text)`       | Simulates realistic human typing with variable speeds     |
| `_safeClick(element)`                  | Performs a safe, human-like click on an element           |
| `_moveMouseRealisticly(targetElement)` | Simulates realistic mouse movement using Bezier curves    |
| `_processDialog(dialog)`               | Handles connection request dialogs including adding notes |
| `_findConnectButtons()`                | Uses multiple strategies to locate connection buttons     |
| `_gatherProfileInfo()`                 | Extracts profile information for personalization          |

## Behavioral Patterns

### Mouse Movement

The assistant simulates natural mouse movements using Bezier curves, creating realistic acceleration and deceleration patterns. Mouse movements follow a non-linear path with slight variations, similar to human hand movements.

### Typing Simulation

When typing personalized notes, the assistant:

- Types at variable speeds depending on character complexity
- Types common letters faster than uncommon ones
- Occasionally makes typing errors and corrects them
- Adds natural pauses between words
- Exhibits "thinking pauses" at natural points in the text

### Click Patterns

The assistant simulates various click behaviors:

- Hesitation before clicking
- Hover behavior before clicking
- Double hesitation patterns (hover, move away, return)
- Natural variations in click timing

### Scrolling Patterns

Multiple scrolling patterns are implemented:

1. **Smooth continuous scrolling**: Gradual acceleration and deceleration
2. **Quick scroll with pauses**: Faster scrolling with natural pauses
3. **Irregular scrolling**: Variable speed with occasional scroll-back behavior

## Adaptive Learning

The assistant implements an adaptive learning system that:

1. Tracks success and failure rates for different interaction types
2. Adjusts timing parameters based on success patterns
3. Maintains a history of successful timing patterns
4. Recognizes and avoids patterns that lead to failures
5. Gradually optimizes timing for the current environment

### Pattern Memory

The assistant memorizes successful selector patterns and reuses them in similar contexts, creating a primitive form of learning that improves performance over time.

## Best Practices

1. **Start with conservative settings**: Begin with higher delay values and gradually reduce them as needed
2. **Use personalized notes**: They appear more authentic and increase connection acceptance rates
3. **Limit session duration**: Keep sessions under 45 minutes to avoid detection
4. **Take breaks**: Enable the `takeMicroBreaks` feature for more natural session patterns
5. **Randomize templates**: Provide multiple connection note templates for variety
6. **Monitor success rates**: Regularly check the stats to ensure effectiveness

## Limitations

1. LinkedIn frequently updates its UI, which may require selector updates
2. Excessive usage may trigger LinkedIn's automation detection systems
3. The assistant can only work on LinkedIn search results pages
4. Performance depends on the stability of the LinkedIn page and network conditions

## License

This software is provided as open-source under MIT License. Use responsibly and in accordance with LinkedIn's terms of service.

---

**Disclaimer**: This tool is provided for educational purposes only. Automated interactions with LinkedIn may violate their terms of service. Use at your own risk.
