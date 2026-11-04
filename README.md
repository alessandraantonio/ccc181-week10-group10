# CCC181 Week 10: CampusConnect Mobile-First Login Page

React + TypeScript starter for the Week 10 group activity. The page is already
built. Your group's job is the **mobile-first CSS** and the **GitHub teamwork**.

## Run it

```bash
npm install
npm run dev          # open the local URL it prints
npm run dev:phone    # same, but your phone (same Wi-Fi) can open the Network URL
npm run build        # must finish with no errors before you submit
```

## Rules

- Edit only the CSS files in `src/styles/` (one member = one file). Do not edit `reset.css`.
- Plain CSS only. No Tailwind, Bootstrap, Material UI, styled-components, or any UI library.
- Phone styles first (no media query), then `min-width` queries only. Never `max-width`.
- Do not edit the `.tsx` files or rename classes. If you must, tell the group first.

## Group information (fill in)

| Item | Your answer |
| --- | --- |
| Group number | 10 |
| Section | Section B |
| Repository URL | https://github.com/alessandraantonio/ccc181-week10-group10 |

## Members (each member fills in their own row in their own commit)

| Member | Name | GitHub username | CSS file | What I did |
| --- | --- | --- | --- | --- |
| 1 (leader) |Alessandra M. Antonio | alessandrantonio | `base.css` | Wrote the base page layout: container, CSS Grid for .login-layout (1 column on phone, 2 columns from 1024px), brand panel styles, the 1280px max-width of 1200px, and added the viewport meta tag.|
| 2 | | | `nav.css` | |
| 3 | | | `form.css` | |

## Experiment 0: the page without the viewport tag

What did the page look like in DevTools phone mode **before** adding the viewport meta tag?
What changed **after** adding it?

> Before the viewport tag, the page in DevTools phone mode looked zoomed out and tiny. The browser assumed a desktop-width screen of about 980px and shrank everything to fit. After adding `<meta name="viewport" content="width=device-width, initial-scale=1" />`, the page used the real phone width and the text became readable at normal size.

## DevTools test results

| Width | What must be true | Pass? |
| --- | --- | --- |
| 360 px | 1 column. Nav links stacked and 48px tall. Options and buttons stacked. Footer in 1 column. No sideways scrollbar. | |
| 768 px | Nav in one row (brand left, links right). Checkbox and link in one row. Two buttons side by side. | |
| 1024 px | Brand panel and login card side by side. Footer in 3 columns. Heading is larger. | |
| 1280 px | Content centered and stops at 1200px. | |

### Breakpoints I observed

Using **Show media queries** and dragging slowly from 360 px to 1280 px, the layout changed at these exact widths:

> The layout changed at 768px (nav links go into one row, checkbox and "Forgot password?" side by side, buttons side by side), at 1024px (brand panel and login card side by side, footer in 3 columns, bigger heading, perks list appears), and at 1280px (content centered with a 1200px max width). No width looked broken and there was no sideways scrollbar.

Screenshots are in `screenshots/` as `360.png`, `768.png`, `1024.png`, `1280.png`.

## What our group learned (leader writes this last)

> We learned to write the phone layout first and add `min-width` media queries only as the screen gets wider. We practiced CSS Grid for the page layout and footer and Flexbox for the navbar and form. We also learned the GitHub workflow: separate branches per member, pull requests reviewed by a teammate, and resolving README merge conflicts by keeping both versions.
