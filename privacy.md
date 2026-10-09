---
layout: default
title: Privacy
permalink: /privacy/
excerpt: What this site collects, which services see your visit, and what stays in your browser.
---
<article>
<header class="post-hero relative isolate overflow-hidden bg-highlight">
<div class="container relative pb-14 pt-14 md:pb-20 md:pt-20">
<p class="font-display text-sm font-medium text-brand-strong md:text-base">Last updated <time datetime="2026-10-09">2026-10-09</time></p>
<h1 class="mt-5 max-w-[20ch] text-balance font-display text-4xl font-extrabold leading-[1.02] tracking-[-0.03em] text-brand-strong md:text-6xl">Privacy</h1>
<p class="mt-6 max-w-[48ch] text-pretty text-xl leading-snug text-accent-strong md:text-2xl">What this site collects, which services see your visit, and what stays in your browser.</p>
</div>
</header>
<div class="container py-12 md:py-16">
<div class="post-content max-w-prose" markdown="1">

This is a personal blog. I don't run analytics, I don't show ads, and the site itself sets no cookies. Here is everything that happens when you visit.

## Hosting

The site is hosted on [GitHub Pages](https://pages.github.com/). GitHub logs the IP address of every visitor for security purposes, as described in the [GitHub Privacy Statement](https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement).

Requests reach GitHub through [Cloudflare](https://www.cloudflare.com/privacypolicy/), which sits in front of the site. Cloudflare may process your IP address to deliver the page and protect it from abuse.

## Fonts

The fonts come from [Google Fonts](https://fonts.google.com/). Your browser downloads them from Google's servers, so your IP address is sent to Google. Google describes what it does with that data in its [privacy policy](https://policies.google.com/privacy).

## Comments

Posts have comments powered by [Disqus](https://disqus.com/). Nothing from Disqus loads until you click "Load comments". After you click, Disqus sets cookies and receives data about your visit, and the [Disqus privacy policy](https://help.disqus.com/en/articles/1717103-disqus-privacy-policy) applies.

## Embedded content

The [STM32 course page]({{ '/curso-stm32/' | relative_url }}) embeds videos from YouTube, and the [about page]({{ '/about/' | relative_url }}) shows a profile badge image from Stack Exchange. Opening those pages makes your browser contact those services, and their own privacy policies apply.

## What stays in your browser

The site keeps two values in your browser's `localStorage`:

- `ecf-intro-seen` remembers that the home page intro animation already played, so it runs faster next time.
- `ecf-idea-seen` remembers that the footer animation already played, so it doesn't play again.

Both only hold the value `1`, never leave your browser, and you can clear them at any time from your browser settings.

## Contact

Questions about this page? Write to me at [email@cleiton.dev](mailto:email@cleiton.dev).

</div>
</div>
</article>
