# AntiRebind

## Introduction

Detects and blocks DNS rebinding attacks through Chrome (and maybe Firefox eventually).

Tracks DNS/IP translations through the web requests API and if a domain switches from a public internet IP address to a private IP address AntiRebind will block further attempts to communicate with that domain. It will also present a block page if you attempt to go to that domain directly.


## Where can I download?

Its available in the [Chrome Web Store](https://chrome.google.com/webstore/detail/anti-rebind/fdicgpiolgkgjjkapjgbehgfefeckmic)
