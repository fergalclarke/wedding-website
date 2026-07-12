/* ===========================================
   Fergal & Avril — Wedding Website
   7th November 2026
   =========================================== */

document.addEventListener('DOMContentLoaded', () => {
  initCurtain();
  initCountdown();
  initScrollAnimations();
  initFixedRSVP();
  initPersonalisation();
  initRSVPForm();
});

/* ============================================================
   CURTAIN REVEAL
   ============================================================ */
function initCurtain() {
  const curtain = document.getElementById('curtain');
  const content = document.getElementById('site-content');
  if (!curtain || !content) return;

  // Skip curtain if already shown this browser session
  if (sessionStorage.getItem('curtainShown')) {
    curtain.classList.add('hidden');
    content.classList.add('visible');
    return;
  }

  sessionStorage.setItem('curtainShown', '1');

  // 900ms pause → panels slide apart → site fades in
  setTimeout(() => {
    curtain.classList.add('open');
    setTimeout(() => content.classList.add('visible'), 650);
    setTimeout(() => curtain.classList.add('hidden'), 1600);
  }, 900);
}

/* ============================================================
   COUNTDOWN TIMER
   ============================================================ */
function initCountdown() {
  const daysEl    = document.getElementById('days');
  const hoursEl   = document.getElementById('hours');
  const minutesEl = document.getElementById('minutes');
  const secondsEl = document.getElementById('seconds');
  if (!daysEl) return;

  // Ceremony is at 14:00 Irish time (UTC+0 in Nov, so UTC+0)
  const target = new Date('2026-11-07T14:30:00');

  function tick() {
    const now  = new Date();
    const diff = target - now;

    if (diff <= 0) {
      daysEl.textContent    = '0';
      hoursEl.textContent   = '00';
      minutesEl.textContent = '00';
      secondsEl.textContent = '00';
      return;
    }

    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000)  / 60000);
    const s = Math.floor((diff % 60000)    / 1000);

    daysEl.textContent    = String(d);
    hoursEl.textContent   = String(h).padStart(2, '0');
    minutesEl.textContent = String(m).padStart(2, '0');
    secondsEl.textContent = String(s).padStart(2, '0');
  }

  tick();
  setInterval(tick, 1000);
}

/* ============================================================
   SCROLL FADE-IN (IntersectionObserver)
   ============================================================ */
function initScrollAnimations() {
  const elements = document.querySelectorAll('.fade-in');
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  elements.forEach(el => observer.observe(el));
}

/* ============================================================
   FIXED RSVP BUTTON
   ============================================================ */
function initFixedRSVP() {
  const btn     = document.getElementById('fixed-rsvp');
  const hero    = document.getElementById('hero');
  const rsvpSec = document.getElementById('rsvp');
  if (!btn || !hero) return;

  function onScroll() {
    const heroBottom = hero.getBoundingClientRect().bottom;
    const rsvpTop    = rsvpSec ? rsvpSec.getBoundingClientRect().top : Infinity;
    const vh         = window.innerHeight;

    // Show after hero, hide when RSVP section is on screen
    if (heroBottom < 0 && rsvpTop > vh) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
}

/* ============================================================
   PERSONALISATION
   ============================================================ */
const GUEST_LIST = {
  'fn8kP2': { greeting: 'Frank & Nicola',    people: ['Frank', 'Nicola']    },
  'en4mQ7': { greeting: 'Enda & Nicola',     people: ['Enda', 'Nicola']     },
  'en4mQ1': { greeting: 'Daryll & Rachael',     people: ['Daryll', 'Rachael']     },
  'mt2jR5': { greeting: 'Martin & Jennifer', people: ['Martin', 'Jennifer'] }
};

function initPersonalisation() {
  const token = new URLSearchParams(window.location.search).get('invite');
  const guest = token ? GUEST_LIST[token] : null;
  if (!guest) return;

  // Personalised greeting above the form
  const greetingEl = document.getElementById('rsvp-greeting');
  if (greetingEl) {
    greetingEl.textContent = `${guest.greeting}, we hope you can join us.`;
    greetingEl.style.display = 'block';
  }

  // Hide the generic name fields — we already know who they are
  const nameRow = document.querySelector('.form-row');
  if (nameRow) nameRow.style.display = 'none';

  // Replace the guest-count select with named checkboxes
  const guestsGroup = document.getElementById('guests')?.closest('.form-group');
  if (guestsGroup) {
    guestsGroup.innerHTML = `
      <label>Who will be attending?</label>
      <div class="checkbox-group">
        ${guest.people.map(name => `
          <label class="checkbox-label">
            <input type="checkbox" name="attendees" value="${name}" checked>
            <span class="checkbox-custom"></span>
            <span class="checkbox-text">${name}</span>
          </label>
        `).join('')}
      </div>
    `;
  }

  // Flag the form so validation knows it's in personalised mode
  const form = document.getElementById('rsvp-form');
  if (form) {
    form.dataset.personalised = 'true';
    form.dataset.guestGreeting = guest.greeting;
  }
}

/* ============================================================
   RSVP FORM
   ============================================================ */
function initRSVPForm() {
  const form           = document.getElementById('rsvp-form');
  const successAccept  = document.getElementById('rsvp-success');
  const successDecline = document.getElementById('rsvp-decline');
  if (!form) return;

  const attendingFields = document.getElementById('attending-fields');
  const attendanceRadios = form.querySelectorAll('input[name="attendance"]');

  // Toggle conditional fields based on attendance selection
  attendanceRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      const attending = form.querySelector('input[name="attendance"]:checked')?.value === 'yes';
      if (attendingFields) {
        attendingFields.style.display = attending ? 'block' : 'none';
      }
    });
  });

  // Show/hide second guest name fields based on guest count
  const guestsSelect = form.querySelector('#guests');
  const secondGuestFields = document.getElementById('second-guest-fields');
  if (guestsSelect && secondGuestFields) {
    guestsSelect.addEventListener('change', () => {
      secondGuestFields.style.display = guestsSelect.value === '2' ? 'block' : 'none';
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    if (!validateForm(form)) return;

    const submitBtn  = form.querySelector('.btn-submit');
    const btnText    = form.querySelector('.btn-submit-text');
    const btnLoading = form.querySelector('.btn-submit-loading');

    submitBtn.disabled      = true;
    btnText.style.display   = 'none';
    btnLoading.style.display = 'inline';

    const attending = form.querySelector('input[name="attendance"]:checked')?.value === 'yes';

    try {
      const personalised = form.dataset.personalised === 'true';
      let name;
      if (personalised) {
        const checked = [...form.querySelectorAll('input[name="attendees"]:checked')];
        name = checked.length ? checked.map(cb => cb.value).join(' & ') : form.dataset.guestGreeting;
      } else {
        const first = form.querySelector('#first-name').value.trim();
        const last  = form.querySelector('#last-name').value.trim();
        name = `${first} ${last}`.trim();
      }

      const fields = {
        'Name':                 name,
        'Email':                form.querySelector('#email').value.trim(),
        'Attending':            attending ? 'Yes' : 'No',
      };

      if (attending) {
        const guestsVal = form.querySelector('#guests')?.value;
        if (guestsVal) fields['Guest count'] = parseInt(guestsVal, 10) || guestsVal;

        if (guestsVal === '2') {
          const g2first = form.querySelector('#guest2-first-name')?.value.trim();
          const g2last  = form.querySelector('#guest2-last-name')?.value.trim();
          const g2name  = `${g2first} ${g2last}`.trim();
          if (g2name) fields['Name'] = `${fields['Name']} & ${g2name}`;

          const dietary2 = form.querySelector('#dietary2')?.value.trim();
          if (dietary2) fields['Guest 2 Dietary Requirements'] = dietary2;
        }

        const dietary = form.querySelector('#dietary')?.value.trim();
        if (dietary) fields['Dietary Requirements'] = dietary;
      }

      const res = await fetch('https://api.airtable.com/v0/appgdR9Op0vSdrLC5/RSVP', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer patuPnha2dX3tQtqU.17d112988ec8553d89b35f98700bd8778635b34650127f495e30dd920a1d3edc',
          'Content-Type':  'application/json',
        },
        body: JSON.stringify({ fields }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message || `HTTP ${res.status}`);
      }
    } catch (err) {
      console.error('RSVP submission failed:', err);
      submitBtn.disabled       = false;
      btnText.style.display    = 'inline';
      btnLoading.style.display = 'none';
      showError('Something went wrong — please try again or email us directly.');
      return;
    }

    form.style.display = 'none';
    if (attending && successAccept)  successAccept.style.display  = 'block';
    if (!attending && successDecline) successDecline.style.display = 'block';
  });
}

/* ---- Validation ---- */
function validateForm(form) {
  const personalised = form.dataset.personalised === 'true';
  const email        = form.querySelector('#email').value.trim();
  const attendance   = form.querySelector('input[name="attendance"]:checked');

  // Name fields only required in the generic (non-personalised) flow
  if (!personalised) {
    const firstName = form.querySelector('#first-name').value.trim();
    const lastName  = form.querySelector('#last-name').value.trim();
    if (!firstName) {
      showError('Please enter your first name.');
      form.querySelector('#first-name').focus();
      return false;
    }
    if (!lastName) {
      showError('Please enter your last name.');
      form.querySelector('#last-name').focus();
      return false;
    }
  }

  if (!email || !isValidEmail(email)) {
    showError('Please enter a valid email address.');
    form.querySelector('#email').focus();
    return false;
  }

  if (!attendance) {
    showError("Please let us know whether you'll be attending.");
    return false;
  }

  // In personalised mode, at least one named attendee must be checked
  if (personalised && attendance.value === 'yes') {
    const checked = form.querySelectorAll('input[name="attendees"]:checked');
    if (checked.length === 0) {
      showError('Please select at least one person attending.');
      return false;
    }
  }

  return true;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showError(message) {
  clearErrors();
  const el = document.createElement('div');
  el.className   = 'form-error';
  el.textContent = message;
  const form = document.getElementById('rsvp-form');
  form.insertBefore(el, form.firstChild);
  el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  setTimeout(() => el.remove(), 5000);
}

function clearErrors() {
  document.querySelectorAll('.form-error').forEach(el => el.remove());
}

