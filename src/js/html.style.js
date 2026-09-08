/**
 * html.style v2026.1.0
 * Optional JavaScript enhancements
 * Native-first, progressive enhancement
 */

/**
 * Theme Management
 * Browser-native theme detection and switching
 */
const ThemeManager = {
  init() {
    this.setupThemeToggle();
    this.listenForSystemChanges();
    this.checkGPC();
  },

  /**
   * Initialize theme from localStorage or system preference
   */
  setupThemeToggle() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme) {
      document.documentElement.style.colorScheme = savedTheme;
    } else if (prefersDark) {
      document.documentElement.style.colorScheme = 'dark';
    }
  },

  /**
   * Toggle between light and dark themes
   */
  toggle() {
    const currentScheme = document.documentElement.style.colorScheme || 'light';
    const newScheme = currentScheme === 'dark' ? 'light' : 'dark';

    document.documentElement.style.colorScheme = newScheme;
    localStorage.setItem('theme', newScheme);

    return newScheme;
  },

  /**
   * Set specific theme
   * @param {'light'|'dark'|'auto'} theme
   */
  setTheme(theme) {
    if (theme === 'auto') {
      document.documentElement.style.colorScheme = '';
      localStorage.removeItem('theme');

      // Apply system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.style.colorScheme = prefersDark ? 'dark' : 'light';
    } else {
      document.documentElement.style.colorScheme = theme;
      localStorage.setItem('theme', theme);
    }
  },

  /**
   * Listen for system theme preference changes
   */
  listenForSystemChanges() {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      // Only auto-switch if user hasn't manually set a preference
      if (!localStorage.getItem('theme')) {
        document.documentElement.style.colorScheme = e.matches ? 'dark' : 'light';
      }
    });
  },

  /**
   * Check for Global Privacy Control (GPC) signal
   */
  checkGPC() {
    if (navigator.globalPrivacyControl) {
      console.log('[html.style] GPC signal detected - user has opted out of tracking');

      // Disable any analytics or tracking
      window.disableAnalytics = true;

      // Could display a confirmation message
      this.showGPCConfirmation();
    }
  },

  /**
   * Show GPC opt-out confirmation (optional)
   */
  showGPCConfirmation() {
    // Only show if user hasn't dismissed it before
    if (sessionStorage.getItem('gpc-confirmed')) return;

    const message = document.createElement('div');
    message.className = 'alert alert--info';
    message.setAttribute('role', 'alert');
    message.style.position = 'fixed';
    message.style.insetBlockEnd = 'var(--space-inline)';
    message.style.insetInlineEnd = 'var(--space-inline)';
    message.style.maxInlineSize = '400px';
    message.style.zIndex = '1000';
    message.style.boxShadow = 'var(--p-shadow-lg)';

    message.innerHTML = `
      <div class="stack" style="--space-block: var(--p-space-sm);">
        <strong>Privacy Preference Honored</strong>
        <p style="margin: 0; font-size: var(--text-small);">
          We've detected your opt-out signal (GPC) and have disabled all tracking.
        </p>
        <button onclick="this.closest('.alert').remove(); sessionStorage.setItem('gpc-confirmed', 'true');"
                style="align-self: flex-start; font-size: var(--text-small); padding: var(--p-space-xs) var(--space-component);">
          Got it
        </button>
      </div>
    `;

    document.body.appendChild(message);
  }
};

/**
 * Form Enhancements
 * Progressive enhancement for forms
 */
const FormEnhancements = {
  init() {
    this.setupFormValidation();
  },

  /**
   * Add visual feedback for form validation
   */
  setupFormValidation() {
    const forms = document.querySelectorAll('form');

    forms.forEach(form => {
      // Use native HTML5 validation, just enhance the UX
      form.addEventListener('submit', (e) => {
        if (!form.checkValidity()) {
          e.preventDefault();

          // Find first invalid field and focus it
          const firstInvalid = form.querySelector(':invalid');
          if (firstInvalid) {
            firstInvalid.focus();
          }
        }
      });

      // Real-time validation feedback
      const inputs = form.querySelectorAll('input, textarea, select');
      inputs.forEach(input => {
        input.addEventListener('blur', () => {
          // Only show validation state after user has interacted
          if (input.validity.valid) {
            input.style.borderColor = 'var(--color-feedback-success)';
          } else if (input.value) {
            input.style.borderColor = 'var(--color-feedback-error)';
          }
        });

        // Clear validation state on focus
        input.addEventListener('focus', () => {
          input.style.borderColor = '';
        });
      });
    });
  }
};

/**
 * Smooth Scroll for Skip Links
 */
const SmoothScroll = {
  init() {
    // Only if user hasn't requested reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;

        const target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });

          // Set focus for keyboard users
          target.focus();
        }
      });
    });
  }
};

/**
 * Dialog Enhancements
 * Polyfill and enhancements for native <dialog>
 */
const DialogEnhancements = {
  init() {
    // Close dialog on backdrop click
    document.querySelectorAll('dialog').forEach(dialog => {
      // A dialog owned by <hs-dialog> manages its own dismissal, natively via
      // closedBy where available. Handling it here too produced two competing
      // closers and defeated the component's `persistent` opt-out.
      if (dialog.closest('hs-dialog')) return;

      dialog.addEventListener('click', (e) => {
        if (e.target === dialog) {
          dialog.close();
        }
      });

      // Close on Escape key (native behavior, but ensure it works)
      dialog.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          dialog.close();
        }
      });
    });
  }
};

/**
 * Copy to Clipboard Helper
 * Utility for copying text (code examples, etc.)
 */
const ClipboardHelper = {
  init() {
    // Add copy buttons to code blocks
    document.querySelectorAll('pre code').forEach(codeBlock => {
      const button = document.createElement('button');
      button.textContent = 'Copy';
      button.className = 'button--secondary';
      button.style.position = 'absolute';
      button.style.insetBlockStart = 'var(--p-space-xs)';
      button.style.insetInlineEnd = 'var(--p-space-xs)';
      button.style.fontSize = 'var(--text-small)';
      button.style.padding = 'var(--p-space-xs) var(--space-component)';

      button.addEventListener('click', async () => {
        const code = codeBlock.textContent;
        try {
          await navigator.clipboard.writeText(code);
          button.textContent = 'Copied!';
          setTimeout(() => {
            button.textContent = 'Copy';
          }, 2000);
        } catch (err) {
          console.error('Failed to copy:', err);
        }
      });

      const pre = codeBlock.parentElement;
      pre.style.position = 'relative';
      pre.appendChild(button);
    });
  }
};

/**
 * Initialize all enhancements when DOM is ready
 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

function init() {
  ThemeManager.init();
  FormEnhancements.init();
  SmoothScroll.init();
  DialogEnhancements.init();
  // ClipboardHelper.init(); // Uncomment if you want copy buttons on code blocks
}

/**
 * Web Components for Reusable HTML Elements
 * Native browser approach for partial reusability
 * Easy to remove: Delete this entire block if not needed
 */
class SiteHeader extends HTMLElement {
  connectedCallback() {
    // Extract slot content from children (e.g., <span slot="title">Custom</span>)
    const getSlot = (name, fallback) => {
      const el = this.querySelector(`[slot="${name}"]`);
      return el ? el.textContent : fallback;
    };

    const title = getSlot('title', 'html.style');
    const subtitle = getSlot('subtitle', 'Modern Web Standards Framework');
    const nav1 = getSlot('nav1', 'Features');
    const nav2 = getSlot('nav2', 'Components');
    const nav3 = getSlot('nav3', 'Docs');

    // Replace content with rendered header
    this.innerHTML = `
      <header class="site-header">
        <div class="center">
          <div class="cluster" style="justify-content: space-between;">
            <div>
              <h1 style="margin: 0; font-size: var(--text-heading-lg);">${title}</h1>
              <p style="margin: 0; font-size: var(--text-small); color: var(--color-text-secondary);">
                ${subtitle}
              </p>
            </div>

            <nav class="site-nav" aria-label="Main navigation">
              <ul>
                <li><a href="#features">${nav1}</a></li>
                <li><a href="#components">${nav2}</a></li>
                <li><a href="#docs">${nav3}</a></li>
              </ul>
            </nav>
          </div>
        </div>
      </header>
    `;
  }
}

customElements.define('site-header', SiteHeader);

/**
 * Export for use in other modules
 */
export { ThemeManager, FormEnhancements, SmoothScroll, DialogEnhancements, ClipboardHelper };
