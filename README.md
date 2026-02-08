# harutyunyan.me

Personal website for Artur Harutyunyan.

This repository is intentionally **simple**: a single-page static site (`index.html`) with minimal CSS/JS.

## Run locally

Any static server works. For example:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Contact form (important)

Email sending from a static frontend requires a **form-to-email provider** (no custom backend needed).

### Option A (recommended): Web3Forms

Web3Forms works with a plain HTML form posting to `https://api.web3forms.com/submit` and an `access_key` field.

1. Create an access key in Web3Forms.
2. In `index.html`, search for `WEB3FORMS_ACCESS_KEY` and replace it with your real key.

Docs:
- https://docs.web3forms.com/getting-started/installation
- https://docs.web3forms.com/getting-started/api-reference

### Option B: Formspree

1. Create a Formspree form and get your endpoint: `https://formspree.io/f/{form_id}`
2. In `index.html`, set the form `action` to your endpoint (replace `FORM_ID`).

Docs:
- https://formspree.io/library/html/

### Behavior

The form shows:
- success state on 2xx responses
- error state on non-2xx / network failures
- a clear “not configured” error if the provider key/ID is still a placeholder

### Alternative providers

If you prefer Netlify Forms or another provider, you can change the `<form action="...">` and the JS logic in `js/site.js`.

## Booking link

The “Book a call” links point to a Google Calendar booking page:

- `https://calendar.app.google/bk7sTPuafyLbbimB9`

## Structure

- `index.html`: content + layout (single page)
- `css/site.css`: minimalist styling (single accent color)
- `js/site.js`: contact form submission + status UX
- `CV.pdf`: downloadable CV

## Security note

Legacy email-sending PHP code was removed because it contained hard-coded SMTP credentials.
