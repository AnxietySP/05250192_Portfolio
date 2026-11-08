// ==========================================
// 1. CUSTOM COPPER CURSOR
// ==========================================

const cursor = document.querySelector('.cursor');
const ring = document.querySelector('.cursor-ring');

const isTouchDevice = () =>
  window.matchMedia('(hover: none), (pointer: coarse)').matches;

if (!isTouchDevice() && cursor && ring) {
  const interactiveSelector = [
    'a',
    'button',
    'input',
    'textarea',
    '.project-card',
    '.planet',
    '.social-row',
    '.view-btn',
    '.close-modal'
  ].join(', ');

  let mouseX = 0;
  let mouseY = 0;
  let ringX = 0;
  let ringY = 0;
  let cursorVisible = false;

  function setCursorVisible(visible) {
    cursorVisible = visible;
    cursor.style.opacity = visible ? '1' : '0';
    ring.style.opacity = visible ? '1' : '0';
  }

  // Stay hidden until the mouse first moves, so the orb doesn't
  // sit in the top-left corner on page load.
  setCursorVisible(false);

  document.addEventListener('mousemove', (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;

    cursor.style.left = `${mouseX}px`;
    cursor.style.top = `${mouseY}px`;

    if (!cursorVisible) {
      ringX = mouseX;
      ringY = mouseY;
      setCursorVisible(true);
    }
  });

  function animateRing() {
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;

    ring.style.left = `${ringX}px`;
    ring.style.top = `${ringY}px`;

    requestAnimationFrame(animateRing);
  }

  animateRing();

  // Event delegation also supports dynamically added elements.
  document.addEventListener('mouseover', (event) => {
    if (event.target.closest(interactiveSelector)) {
      document.body.classList.add('hover');
    }
  });

  document.addEventListener('mouseout', (event) => {
    if (
      event.target.closest(interactiveSelector) &&
      !event.relatedTarget?.closest(interactiveSelector)
    ) {
      document.body.classList.remove('hover');
    }
  });

  // mouseleave/mouseenter do not fire on `document`, so use the root element.
  document.documentElement.addEventListener('mouseleave', () => {
    setCursorVisible(false);
  });

  document.documentElement.addEventListener('mouseenter', () => {
    setCursorVisible(true);
  });
}


// ==========================================
// 2. DARK MODE TOGGLE
// ==========================================

const themeToggleBtn = document.getElementById('theme-toggle');

function getSavedTheme() {
  try {
    return localStorage.getItem('theme') || 'light';
  } catch (error) {
    return 'light';
  }
}

function saveTheme(isDark) {
  try {
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  } catch (error) {
    // The theme still works for this page if storage is unavailable.
  }
}

function renderTheme(isDark) {
  document.body.classList.toggle('dark-mode', isDark);

  if (!themeToggleBtn) return;

  themeToggleBtn.innerHTML = isDark
    ? '<i class="fas fa-sun" aria-hidden="true"></i>'
    : '<i class="fas fa-moon" aria-hidden="true"></i>';

  themeToggleBtn.setAttribute(
    'aria-label',
    isDark ? 'Switch to light mode' : 'Switch to dark mode'
  );
  themeToggleBtn.setAttribute('aria-pressed', String(isDark));
}

renderTheme(getSavedTheme() === 'dark');

if (themeToggleBtn) {
  themeToggleBtn.addEventListener('click', () => {
    const isDark = !document.body.classList.contains('dark-mode');

    renderTheme(isDark);
    saveTheme(isDark);
  });
}


// ==========================================
// 3. CERTIFICATE MODAL
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('certificateModal');
  const modalImg = document.getElementById('fullCertificateImg');
  const closeBtn = document.querySelector('.close-modal');
  const viewBtns = document.querySelectorAll('.view-btn');

  if (!modal || !modalImg || !closeBtn) return;

  let lastTrigger = null;

  function openModal(imageSource, trigger) {
    if (!imageSource) return;

    lastTrigger = trigger;

    modalImg.src = imageSource;
    modal.style.display = 'flex';
    modal.setAttribute('aria-hidden', 'false');

    document.body.style.overflow = 'hidden';

    closeBtn.focus();
  }

  function closeModal() {
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');

    document.body.style.overflow = '';

    modalImg.removeAttribute('src');

    // Return keyboard focus to the button that opened the modal.
    if (lastTrigger) {
      lastTrigger.focus();
      lastTrigger = null;
    }
  }

  viewBtns.forEach((button) => {
    button.addEventListener('click', () => {
      openModal(button.getAttribute('data-img'), button);
    });
  });

  closeBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal.style.display === 'flex') {
      closeModal();
    }
  });
});


// ==========================================
// 4. INTERACTIVE ROBOT ASSISTANT
// ==========================================

(() => {
  if (document.querySelector('.robot-assistant')) return;

  const robot = document.createElement('div');
  robot.className = 'robot-assistant';

  robot.innerHTML = `
    <div class="robot-message">
      <span class="robot-message-text">
        Hey there! Welcome to Sonam's portfolio!
      </span>
    </div>

    <div class="robot-character">
      <div class="robot-aura"></div>

      <div class="robot-antenna">
        <span></span>
      </div>

      <div class="robot-head">
        <div class="robot-ear left"></div>
        <div class="robot-ear right"></div>

        <div class="robot-face">
          <div class="robot-eyes">
            <span class="robot-eye left-eye"><i></i></span>
            <span class="robot-eye right-eye"><i></i></span>
          </div>

          <div class="robot-mouth"></div>
        </div>
      </div>

      <div class="robot-neck"></div>

      <div class="robot-body">
        <div class="robot-chest-light"></div>
      </div>
    </div>

    <button
      class="robot-close"
      aria-label="Hide robot assistant"
      type="button"
    >×</button>
  `;

  document.body.appendChild(robot);

  const message = robot.querySelector('.robot-message-text');
  const closeButton = robot.querySelector('.robot-close');
  const pupils = robot.querySelectorAll('.robot-eye i');

  const expressions = ['happy', 'curious', 'excited', 'thinking', 'wave'];

  let messageTimer;
  let lastScroll = window.scrollY;
  let lastActivity = Date.now();

  function speak(text, expression = 'happy') {
    if (robot.classList.contains('robot-hidden')) return;

    message.textContent = text;

    robot.classList.remove(...expressions.map((name) => `robot-${name}`));
    robot.classList.add(`robot-${expression}`, 'robot-talking');

    clearTimeout(messageTimer);

    messageTimer = setTimeout(() => {
      robot.classList.remove('robot-talking');
    }, 4500);
  }

  function getCurrentPage() {
    const page = document.body.dataset.page;

    if (page) return page.toLowerCase();

    const filename = window.location.pathname
      .split('/')
      .pop()
      .replace('.html', '');

    return filename || 'home';
  }

  const pageMessages = {
    home: [
      "Welcome! I'm your little portfolio companion.",
      "Feel free to explore Sonam's world!"
    ],

    about: [
      "Want to know more about Sonam?",
      "Here's the person behind this portfolio!"
    ],

    skills: [
      "Let's explore some technical skills!",
      "Networking and coding? Interesting combination!"
    ],

    projects: [
      "Now we're talking! Let's explore the projects.",
      "I love seeing ideas become reality!"
    ],

    certificates: [
      "Learning never stops!",
      "Every certificate represents another achievement."
    ],

    contact: [
      "Want to connect with Sonam?",
      "Let's make something amazing together!"
    ]
  };

  function welcomePage() {
    const messages = pageMessages[getCurrentPage()] || pageMessages.home;
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];

    speak(randomMessage);
  }

  // Eyes follow the visitor's cursor
  document.addEventListener('mousemove', (event) => {
    lastActivity = Date.now();

    if (isTouchDevice()) return;

    const rect = robot.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + 65;

    const dx = event.clientX - centerX;
    const dy = event.clientY - centerY;

    const angle = Math.atan2(dy, dx);
    const distance = Math.min(4, Math.hypot(dx, dy) / 100);

    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;

    pupils.forEach((pupil) => {
      pupil.style.transform = `translate(${x}px, ${y}px)`;
    });
  });

  // Click reactions
  document.addEventListener('click', (event) => {
    if (event.target.closest('.robot-assistant')) return;

    lastActivity = Date.now();

    const target = event.target.closest('a, button, .planet');

    if (!target) {
      speak("I see you exploring! 👀", 'curious');
    } else if (target.closest('#theme-toggle')) {
      speak("Changing the atmosphere? Nice!", 'happy');
    } else if (target.closest('.view-btn')) {
      speak("Let's take a closer look!", 'curious');
    } else if (target.closest('.socials')) {
      speak("Connecting with the world!", 'happy');
    } else if (target.matches('a')) {
      const destination = target.getAttribute('href') || '';

      if (destination.endsWith('.html')) {
        const page = destination.split('/').pop().replace('.html', '');
        const messages = pageMessages[page];

        if (messages) {
          speak(messages[0], 'excited');
        }
      } else {
        speak("Opening something interesting!", 'excited');
      }
    } else {
      speak("Hey! I noticed that click!", 'excited');
    }
  });

  // Scroll reactions
  window.addEventListener('scroll', () => {
    lastActivity = Date.now();

    const currentScroll = window.scrollY;

    if (Math.abs(currentScroll - lastScroll) > 80) {
      if (currentScroll > lastScroll) {
        speak("Let's see what's further down!", 'curious');
      } else {
        speak("Going back for another look?", 'happy');
      }

      lastScroll = currentScroll;
    }
  }, { passive: true });

  // Idle detection
  const idleTimer = setInterval(() => {
    if (Date.now() - lastActivity > 12000) {
      speak("Still there? Take your time exploring!", 'curious');
      lastActivity = Date.now();
    }
  }, 3000);

  // Hide robot
  closeButton.addEventListener('click', () => {
    robot.classList.add('robot-hidden');

    clearTimeout(messageTimer);
    clearInterval(idleTimer);
  });

  // Initial welcome
  setTimeout(welcomePage, 1200);
})();


// ==========================================
// 5. SMOOTH PAGE TRANSITIONS
// ==========================================

document.addEventListener('click', (event) => {
  const link = event.target.closest('a[href]');

  if (!link) return;

  // Ignore modified clicks, downloads and new tabs.
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.ctrlKey ||
    event.metaKey ||
    event.shiftKey ||
    event.altKey ||
    link.target === '_blank' ||
    link.hasAttribute('download') ||
    link.hasAttribute('data-no-transition')
  ) {
    return;
  }

  const url = new URL(link.href, window.location.href);

  // Only animate navigation to other pages on this website.
  if (
    url.origin !== window.location.origin ||
    !['http:', 'https:'].includes(url.protocol) ||
    url.pathname === window.location.pathname
  ) {
    return;
  }

  // Respect reduced-motion settings.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  event.preventDefault();

  document.body.classList.add('page-exit');

  setTimeout(() => {
    window.location.href = url.href;
  }, 350);
});

// When the browser restores a page from its back/forward cache, the
// "page-exit" class would still be on <body> and the page would stay invisible.
window.addEventListener('pageshow', (event) => {
  if (event.persisted) {
    document.body.classList.remove('page-exit');
  }
});