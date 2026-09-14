# Product Overview

## What is it?

Markdown Editor RJ is a small, ready-made text editor component that
developers can drop into their React or Next.js websites and apps. It
gives anyone typing in a text box an easy way to add basic formatting —
bold, italic, strikethrough, and bulleted lists — using simple Markdown
symbols (like wrapping a word in `**` to make it bold), plus toolbar
buttons that do the same thing with a click.

It is not an app that end users install. It is a building block that
software developers add to their own products, the same way they would
add any other reusable piece of interface.

## How is it different from similar products?

Many Markdown editors try to do everything: live preview panes, image
uploads, tables, syntax highlighting, split-screen editing, and so on.
Those are powerful but heavy, and often come with a lot of setup and
visual style that has to be undone or overridden to fit into someone
else's website.

This one takes the opposite approach. It focuses on being small,
simple, and easy to restyle:

- It only handles the formatting people use most often (bold, italic,
  strikethrough, lists), instead of trying to support every Markdown
  feature.
- It ships with very little extra weight, so it does not slow down the
  websites that use it.
- Its appearance (colors, spacing, fonts, rounded corners) is
  controlled through a small set of adjustable style settings, so a
  developer can quickly reskin it to match their own website instead of
  fighting against a fixed look.

## Features

- **Bold formatting** — wrap selected text with `**`
- **Italic formatting** — wrap selected text with `_`
- **Strikethrough formatting** — wrap selected text with `~`
- **Bulleted lists** — add `- ` to the start of each selected line
- **Toolbar buttons** — click instead of typing symbols by hand
- **Customizable behavior** — the surrounding app can control things
  like placeholder text, character limit, number of visible rows,
  whether it's read-only or disabled, and what happens when the user
  types, pastes, focuses, or leaves the field
- **Restyleable appearance** — colors, fonts, spacing, and rounded
  corners can all be adjusted to match the host website's look

## Who is it for?

It is built for software developers — specifically those building
websites or apps with React or Next.js — who need a simple text field
with basic formatting (for things like comments, messages, notes, or
descriptions) but do not want to bring in a large, full-featured
Markdown editor just to get bold and italic text.

It is distributed as an installable package (via npm) rather than a
standalone product, so the people who "use" it directly are developers,
while the people who benefit from it are the end users typing into the
apps those developers build.
