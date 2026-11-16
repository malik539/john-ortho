/* John Orthodontics — Facial Aesthetic Plan landing page
   Minimal, dependency-free JS. See README.md for the pending integrations. */
(function () {
  'use strict';

  /* ------------------------------------------------------------------
     CONFIG — fill these in when the campaign assets are provided.
     - phone: campaign tracking number in E.164, e.g. "+19545551234".
       Leave empty until provided: call buttons then show the placeholder
       and scroll to the form instead of dialing a fake number.
     - formEndpoint: URL that accepts the POSTed lead (GHL / LeadConnector
       webhook, Gravity Forms REST, Zapier, etc.). Leave empty until wired:
       the form will NOT pretend to submit.
     - thankYouUrl: optional redirect after a successful submit (for Google
       Ads / GA4 conversion pages). Leave empty to show inline confirmation.
  ------------------------------------------------------------------ */
  var CONFIG = {
    phone: '',
    phoneDisplay: 'XXX-xxx-xxxx',
    formEndpoint: '',
    thankYouUrl: ''
  };

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------------------------------------------------- Phone wiring */
  $$('[data-tel-text]').forEach(function (el) { el.textContent = CONFIG.phoneDisplay; });
  $$('[data-tel]').forEach(function (a) {
    if (CONFIG.phone) {
      a.setAttribute('href', 'tel:' + CONFIG.phone);
      a.removeAttribute('data-tel-pending');
    } else {
      // No real number yet: keep the link pointing at the form.
      a.setAttribute('href', '#consultation');
      a.setAttribute('data-tel-pending', 'true');
      a.setAttribute('title', 'Phone number coming soon. Request a free consultation instead.');
    }
  });

  /* ---------------------------------------------------- Header shadow */
  var header = $('.site-header');
  var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 8); };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* --------------------------------------- Smooth focus for CTA links */
  var firstField = $('#first-name');
  $$('a[href="#consultation"]').forEach(function (a) {
    a.addEventListener('click', function () {
      // After the browser scrolls, move focus to the first field (no page jump).
      window.setTimeout(function () {
        if (firstField && window.matchMedia('(min-width: 1024px)').matches) {
          firstField.focus({ preventScroll: true });
        }
      }, 450);
    });
  });

  /* ------------------------- Sticky bar: hide while the form is visible */
  var sticky = $('#sticky-cta');
  var formCard = $('#consultation');
  if (sticky && formCard && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { sticky.classList.toggle('is-hidden', e.isIntersecting); });
    }, { threshold: 0.15 });
    io.observe(formCard);
  }

  /* ---------------------------------------------------- Footer year */
  var yr = $('#year'); if (yr) yr.textContent = String(new Date().getFullYear());

  /* ------------------------------------------------------------ Form */
  var form = $('#consult-form');
  if (!form) return;

  var status = $('#form-status');
  var submitBtn = $('#submit-btn');
  var started = $('#form-started');
  var patientType = $('#patient-type');
  var newPatientNote = $('#new-patient-note');

  form.addEventListener('focusin', function () { if (!started.value) started.value = String(Date.now()); }, { once: true });

  patientType.addEventListener('change', function () {
    newPatientNote.hidden = patientType.value !== 'Existing Patient';
  });

  var rules = {
    'first-name': { test: function (v) { return v.trim().length > 0; }, msg: 'Please enter your first name.' },
    'last-name':  { test: function (v) { return v.trim().length > 0; }, msg: 'Please enter your last name.' },
    'email':      { test: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()); }, msg: 'Please enter a valid email address.' },
    'phone':      { test: function (v) { return v.replace(/\D/g, '').length >= 10; }, msg: 'Please enter a valid phone number.' },
    'patient-type': { test: function (v) { return v !== ''; }, msg: 'Please let us know if you are a new or existing patient.' }
  };

  function setError(id, msg) {
    var input = document.getElementById(id);
    var err = document.getElementById(id + '-error');
    if (!input || !err) return;
    err.textContent = msg || '';
    if (msg) { input.setAttribute('aria-invalid', 'true'); input.setAttribute('aria-describedby', id + '-error'); }
    else { input.removeAttribute('aria-invalid'); input.removeAttribute('aria-describedby'); }
  }

  function validate() {
    var firstBad = null;
    Object.keys(rules).forEach(function (id) {
      var input = document.getElementById(id);
      var ok = rules[id].test(input.value);
      setError(id, ok ? '' : rules[id].msg);
      if (!ok && !firstBad) firstBad = input;
    });
    return firstBad;
  }

  Object.keys(rules).forEach(function (id) {
    var input = document.getElementById(id);
    input.addEventListener('blur', function () { if (input.value) setError(id, rules[id].test(input.value) ? '' : rules[id].msg); });
    input.addEventListener('input', function () { if (input.getAttribute('aria-invalid')) setError(id, rules[id].test(input.value) ? '' : rules[id].msg); });
  });

  // Light phone formatting: (999) 999-9999 while typing US numbers.
  var phone = $('#phone');
  phone.addEventListener('input', function () {
    var d = phone.value.replace(/\D/g, '').slice(0, 10);
    var out = d;
    if (d.length > 6) out = '(' + d.slice(0, 3) + ') ' + d.slice(3, 6) + '-' + d.slice(6);
    else if (d.length > 3) out = '(' + d.slice(0, 3) + ') ' + d.slice(3);
    else if (d.length > 0) out = '(' + d;
    phone.value = out;
  });

  function showStatus(kind, text) {
    status.className = 'form-status is-' + kind;
    status.textContent = text;
  }

  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    status.className = 'form-status'; status.textContent = '';

    // Honeypot / timing bot checks.
    if (form.website.value) { showStatus('success', 'Thank you.'); return; }
    var elapsed = started.value ? Date.now() - Number(started.value) : 0;

    var bad = validate();
    if (bad) { bad.focus(); showStatus('error', 'Please check the highlighted fields.'); return; }

    if (!CONFIG.formEndpoint) {
      // Honest fallback: nothing is wired yet, so say so instead of faking a success.
      showStatus('pending', 'Online requests are not connected yet. Please call ' + CONFIG.phoneDisplay + ' to book your free consultation. (Developer note: set CONFIG.formEndpoint in assets/js/main.js.)');
      return;
    }

    var data = new FormData(form);
    data.append('page_url', location.href);
    data.append('elapsed_ms', String(elapsed));

    submitBtn.setAttribute('aria-busy', 'true');
    $('.btn-label', submitBtn).textContent = 'Sending…';

    fetch(CONFIG.formEndpoint, { method: 'POST', body: data, mode: 'cors' })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r; })
      .then(function () {
        if (CONFIG.thankYouUrl) { location.assign(CONFIG.thankYouUrl); return; }
        form.reset();
        newPatientNote.hidden = true;
        showStatus('success', 'Thank you! Your request has been received. The John Orthodontics team will contact you shortly to schedule your free consultation.');
        if (typeof window.dataLayer !== 'undefined') window.dataLayer.push({ event: 'consultation_form_submit', campaign: 'Facial Aesthetic Plan' });
      })
      .catch(function () {
        showStatus('error', 'Sorry, something went wrong sending your request. Please try again or call ' + CONFIG.phoneDisplay + '.');
      })
      .then(function () {
        submitBtn.removeAttribute('aria-busy');
        $('.btn-label', submitBtn).textContent = 'Request My Free Consultation';
      });
  });
})();
