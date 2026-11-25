# Untitled

Exported from [this OS](https://www.magicpatterns.com/os/aG8GiqgDDw7M5fmGX4XqPn) on [Magic Patterns](https://magicpatterns.com).

## Getting started

1. `npm install`
2. `npm run dev`, then open the page you want from the home page

## Pages

- [Admin](pages/admin/) — `src/j4rnZZWqnhMNALKdHZ8T8d.frame`
- [Donor Alert](pages/donor-alert/) — `src/o9pThJqSXhyihjRjaJM5gv.frame`
- [Donor Dashboard](pages/donor-dashboard/) — `src/vSum2cEi8fg5ASaUJEzvnn.frame`
- [Forgot Password](pages/forgot-password/) — `src/b7qpdUa2HMiZT43GBmRCBm.frame`
- [Home](pages/home/) — `src/1WUQztQZipTVEmugphuJqM.frame`
- [Hospital Dashboard](pages/hospital-dashboard/) — `src/j7228o8P61Z2CW1kNDAKoD.frame`
- [Not Found](pages/not-found/) — `src/kDGeYDgpar9A2bHfAUa964.frame`
- [Register](pages/register/) — `src/q3JT8iSzqzc9WuaNHhyM84.frame`
- [Request Timeline](pages/request-timeline/) — `src/78eiisFvUcAAvk4Ncix4GU.frame`
- [Reset Password](pages/reset-password/) — `src/wttFzRaqonYjntcavDSG6e.frame`
- [Sign In](pages/sign-in/) — `src/8xqE7k7wCsciXcaxWgwbsu.frame`
- [States](pages/states/) — `src/owNKu9EWzffBBsA7MbPmgu.frame`
- [uwLMheeBsvj2QXnbEePLDQ](pages/uwlmheebsvj2qxnbeepldq/) — `src/uwLMheeBsvj2QXnbEePLDQ.prototype`

## Animation design

The landing page and animation components live in `src/animation`. The existing home frame opens the landing page, with registration and sign-in routed into the application. The donor and hospital screens reuse the urgency bag; the donor account section derives its donation window from the real profile date and availability.

The labeled sample dashboard is available at `/?screen=/design-preview`. Its interactions use preview data and do not write to the API. The live donor screen remains connected to the existing API adapter.

Run `npm test` for the donation-window calendar checks (Node.js 22.6+ with type stripping). Run `npm run build` to validate all frontend entry points. Scroll motion respects the reduced-motion preference and simplifies on narrow screens.
