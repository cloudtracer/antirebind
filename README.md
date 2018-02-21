# AntiRebind

## Introduction

Detects and blocks DNS rebinding attacks through Chrome (and maybe Firefox eventually).

Tracks DNS/IP translations through the web requests API and if a domain switches from a public Internet IP address to a private IP address AntiRebind will block further attempts to communicate with that domain. It will also present a block page if you attempt to go to that domain directly.

AntiRebind will safely ping the domain if further attempts are made to check if the DNS resolution changed back to an Internet address, and if so will unblock the domain by itself.  Otherwise there is a button to unblock the domain on the block page.

## Where can I download?

Its available in the [Chrome Web Store](https://chrome.google.com/webstore/detail/anti-rebind/fdicgpiolgkgjjkapjgbehgfefeckmic)

## TODO

- Add options page, list blocked domains due to rebinding.
- Add alerts for when a domain is blocked.
- Add content script that can redirect the initiating page to the block page.
- Use content script to detect any RFC1918 requests from public Internet IP address (perhaps option to block those too).
- Build for Firefox.
