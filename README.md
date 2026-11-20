# John Orthodontics — Facial Aesthetic Plan PPC Landing Page

Static, dependency-free landing page for the **Facial Aesthetic Plan** Google Ads campaign.

```
index.html            page markup (offer bar, header, 6 sections, footer, mobile sticky CTA, popup)
assets/css/styles.css mobile-first styles
assets/js/main.js     phone wiring, popup, scroll reveal, form validation/submit, sticky bar
assets/img/           optimized WebP/JPEG crops + logo (sources kept: *-source.*)
```

Preview locally:

```bash
python3 -m http.server 8765
```

then open http://localhost:8765/index.html.

## How the form and popup work

There is exactly **one** form instance. It lives inline in the final section (above the footer) so it works without JavaScript. Every CTA with `data-open-form` opens a native `<dialog>` and *moves* that same form card into it; closing (Escape, backdrop click, X) moves it back. No duplicate IDs, one set of handlers, and typed values survive open/close. A `consultation_form_open` event is pushed to `dataLayer` when the popup opens.

Scroll-reveal uses `data-reveal` + IntersectionObserver, is disabled under `prefers-reduced-motion`, and content stays fully visible when JS is off (the effect is scoped to `html.js`).

## Pending before launch (not wired on purpose)

| Item | Where | Status |
| --- | --- | --- |
| Campaign phone number | `CONFIG.phone` / `CONFIG.phoneDisplay` in `assets/js/main.js` | Placeholder `XXX-xxx-xxxx`. Until set, every call button opens the consultation popup (no fake `tel:`). The main-site numbers were deliberately **not** used. |
| Lead form endpoint | `CONFIG.formEndpoint` in `assets/js/main.js` | Empty. The form validates client-side, then shows an honest "not connected yet" notice. It does **not** pretend to submit. Field `name`s mirror the site's Gravity Form #8 (`input_1`, `input_12`, `input_3`, `input_2`, `input_13`, `input_8`, `input_11`) so a GF REST/webhook or GHL/LeadConnector mapping is straightforward. A direct cross-domain POST to the WordPress Gravity Form will not work (nonce/state/captcha), so use a webhook or embed. |
| Thank-you redirect | `CONFIG.thankYouUrl` | Optional. If empty, inline confirmation is shown and `dataLayer.push({event:'consultation_form_submit'})` fires. |
| GTM / GA4 / Google Ads / Meta Pixel | commented slot in `<head>` of `index.html` | Not added. The main site uses GTM container `GTM-5RTVLJZ`; confirm with the client before reusing it. |
| Bot protection | `#captcha-slot` in the form | Honeypot + time-on-form check are in place. Add reCAPTCHA/Turnstile when a site key is provided. The site's own form uses reCAPTCHA + a math question. |
| Consent copy | `.consent` paragraph in the form | Generic "you agree to be contacted" line + Privacy Policy link (https://johnortho.com/privacy-policy/). The existing site form has no SMS/TCPA consent checkbox; add one if the campaign will text leads. |
| `noindex` | `<meta name="robots">` | Set to `noindex, follow` as a PPC page. Remove if indexing is wanted. |

Nothing above is claimed to be working; none of it has been tested against a live integration.

## Content sources

All copy comes from the client brief or pages verified on johnortho.com on 2026-11-16:

- Headline, exclusivity line, offer, retainer bonus, "woman-owned", "Parkland community member and trustee", financing wording: **client-provided** (used verbatim, not strengthened).
- Dr. John: board-certified, 20 years of work experience and training, Invisalign®/Invisalign Teen®, Self-ligating Pitts 21 System, dental facial orthopedics, English/Portuguese/Spanish, native of Brazil, lives in Parkland: https://johnortho.com/about-dr-john/
- Treatments (Invisalign®, Invisalign Teen®, clear & metal braces, early & adult treatment, iTero®): https://johnortho.com/
- Reviews (Maribel F., Jennifer S., Camille M.): quoted word-for-word from https://johnortho.com/ (including the original typos). No star rating or review count is shown.
- Community (Parkland Youth Soccer, Parkland Youth Baseball, school PTAs): https://johnortho.com/community/
- Address, office hours, Google Maps embed: https://johnortho.com/ (same embed the site uses).
- Form fields and dropdown options: https://johnortho.com/appointment-request/

## Items flagged for client review

0. **Headline**: the client's exact headline is preserved as the full H1 text. It is now typeset as a kicker ("More than straight teeth.") above the main line ("A smile designed to make you look younger.") for impact. No words were changed.

1. **"The only practice in the area…"** is client positioning, not independently verified. It appears once, verbatim, in the Facial Aesthetic Plan section.
2. **"Trustee"** is used exactly as supplied ("Parkland community member and trustee") with no organization named.
3. **Imagery**: two photos were supplied. The Drive file (`Eliane-3550_sk.jpg`, Dr. John with a patient) is cropped for the hero; a photo of Dr. John with a young patient in braces (`dr-john-patient-source.jpg`) is used in the Facial Aesthetic Plan section; the separate headshot (`dr-john-headshot-source.webp`, 687px wide) is used in the doctor section. A higher-resolution headshot would help on large screens. Three further supplied photos (teens, kids with braces, group of kids) head the three Treatment Options cards; the teens photo is cropped so the phone number printed on the beach balls stays out of frame. If more approved patient/practice photos exist, the plan section image is the first one to swap.
4. **Consent wording** (see table above).
5. The main site advertises "0% Financing" and "Gold Plus Invisalign Provider" on some pages; these were **not** used because the brief limits financing copy to "Low Monthly Payments & In-House Financing Available".

## Brand notes

Colors taken from the live site CSS: blue `#00AEEF`, green `#99CA3C`, teal `#003E46`. Accessible derivatives are used for text/buttons (`--blue-text #0079B5`, `--green-text #4F7A12`). Type: Fraunces (display) + Jost (body, close to the site's Century Gothic/Montserrat), loaded from Google Fonts.
