<div align="center">

<img src="docs/logo-animated.svg" width="120" height="120" alt="Esta couve flor logo: a stack tray with a sleepy cauliflower">

# Esta couve flor

**Say it fast in Portuguese and you get "Stack Overflow".**<br>
A blog about the whole stack, from React on the screen down to the clock tree of an STM32.

[![Deploy](https://github.com/klaygomes/klaygomes.github.io/actions/workflows/jekyll.yml/badge.svg)](https://github.com/klaygomes/klaygomes.github.io/actions/workflows/jekyll.yml) [![Site](https://img.shields.io/badge/read%20it-estacouveflor.com-7e23b3)](https://www.estacouveflor.com) [![License: MIT](https://img.shields.io/badge/license-MIT-fad30b)](LICENSE)

<a href="https://www.estacouveflor.com"><img src="docs/hero.webp" alt="Home page: the Esta couve flor headline, with Cleiton holding up the cauliflower mascot" width="100%"></a>

</div>

## What you will find here

I have been shipping software since 2004, for banks, insurers, construction and tourism companies. Most of those years were spent on the frontend; lately, a good part of my spare time goes to ARM Cortex-M chips, the STM32F1 series in particular. This blog is where both sides meet.

A few posts worth starting with:

- [Understanding the heart of the STM32: the clock system](https://www.estacouveflor.com/entendendo-coracao-stm32/): HSI, HSE, the PLL and how the 72 MHz actually reaches your peripherals.
- [Free tools for embedded development](https://www.estacouveflor.com/stm32-sem-usar-ide/): a Cortex-M toolchain with GCC, Make and OpenOCD, no vendor IDE needed.
- [Using GNU Make as your dotfiles manager](https://www.estacouveflor.com/dotfiles-configuration/): one command to set up a fresh Mac.
- [The STM32 course](https://www.estacouveflor.com/curso-stm32/): free video lessons on VSCode, GDB, CMSIS and the Arm toolchain.

## Under the hood

It is a small site, but I treated it like a product.

- **Stack.** Jekyll, Tailwind CSS and PostCSS, deployed to GitHub Pages by Actions. No JavaScript framework.
- **Design tokens.** Every color, radius, shadow and easing lives in [`assets/css/tokens.css`](assets/css/tokens.css) and reaches Tailwind through `var()`, so most of a rebrand happens in one file.
- **Motion.** A first-visit intro and two small video gags with transparent backgrounds (VP9 for Chrome and Firefox, HEVC for Safari), 300 to 500 KB each, loaded only when needed.
- **Respectful by default.** Nothing moves for people who ask for reduced motion, the hero gag skips Save-Data connections and is a real button you can replay from the keyboard.
- **Phones first.** Every page is checked at 390 px wide with zero sideways scrolling.

<div align="center">
<img src="docs/phone.webp" alt="The home page on a phone" height="420">
</div>

## Running it locally

You need Ruby 3.4 with Bundler, and Node 24 (both pinned in [`.ruby-version`](.ruby-version) and [`.nvmrc`](.nvmrc)).

```bash
bundle install
npm ci
npm start         # serves on http://localhost:4000 with live reload
```

The site serves the compiled stylesheet `assets/css/main.build.css` as it is committed; CI does not rebuild it. After changing templates or CSS classes, run:

```bash
npm run build
```

and commit the result together with your change.

```text
_posts/            the articles
_layouts/          page, post and home templates
_includes/         nav, footer, table of contents, article list
assets/css/        tokens.css, main.css and the compiled main.build.css
assets/video/      the transparent clips behind the gags
docs/              images for this README (not published)
```

## Say hi

If a post here saved you an afternoon, or you are stuck on something where the browser and the bare metal meet, I am happy to hear about it: [email@cleiton.dev](mailto:email@cleiton.dev) or [LinkedIn](https://www.linkedin.com/in/klaygomes/).

<sub>[MIT License](LICENSE)</sub>
