# Dandy homepage QA results

Browser: chrome. Harness: qa/dandy-home/harness.html rendered from layout/dandy-home.liquid and sections/dandy-home.liquid (cart drawer stubbed). Screenshots in qa/dandy-home/shots/ (not committed). Gates 6, 8 and 10 are informational here: 6 reports overlaps only, 8 measures CLS on the static harness, 10 lists hrefs for the preview-theme check.

## 390px (page height 12232)

| Gate | Result | Detail |
|---|---|---|
| g4_inventory | pass | cards: ["div.hage__box","span.hero__inset","article.rev.rev--first","article.rev","article.rev","input#HomeWelcomeEmail.welcome__input"]; reviewCards: 3; offenders: []; nonButtonPills: [] |
| g9_fixedBeforeDismiss | pass | fixed: ["div.hh__nav:sticky","div.hage:fixed"]; dialogs: ["div.hage"] |
| g8_cls | pass | withGate: 0; total: 0; preload: {"present":true,"sameSet":true,"rendered":"home-hero-hands-900.webp","sizesMatch":true} |
| g9_afterDismiss | pass | dialogs: []; fixed: ["div.hh__nav:sticky"]; infiniteAnimations: []; tickerLike: [] |
| g1_overflow | pass | scrollWidth: 390; innerWidth: 390; offenders: [] |
| g2_typeFloor | pass | minFontSize: 13; minAt: p.welcome__fine; bodySize: 16; bodyParagraphsUnder16: []; metaParagraphClasses: ["welcome__fine","hf__legal","gear__range","moment__alt","hf__contact","hh__ann","dose__zone"] |
| g3_dashes | pass | count: 0 |
| g4_eyebrows | pass | offenders: [] |
| g5_whitespace | pass | limit: 56; nodes: 264; gaps: [] |
| g6_textOverPhoto | pass | overlaps: [] |
| g7_images | pass | images: [{"src":"dandy-wordmark.svg","complete":true,"natural":"300x112","attrs":"96x36","lazy":"auto","visible":true,"real":"300x112","attrsMatch":true},{"src":"dandy-wordmark.svg","complete":true,"natural":"300x112","attrs":"96x36","lazy":"auto","visible":false,"real":"300x112","attrsMatch":true},{"src":"home-hero-hands-1600.webp","complete":true,"natural":"390x219","attrs":"1600x900","lazy":"auto","visible":true,"real":"1600x900","attrsMatch":true,"candidates":["home-hero-hands-900.webp:900x506","home-hero-hands-1600.webp:1600x900"]},{"src":"home-hero-gummy-900.webp","complete":true,"natural":"900x900","attrs":"900x900","lazy":"lazy","visible":true,"real":"900x900","attrsMatch":true},{"sr |
| g11_hero | pass | h1Lines: 3; h1Size: 40; ledeLines: 5; buttonWidth: 350; contentWidth: 350; photoWidth: 390; photoHeight: 219; photoUncropped: true; photoEdgeToEdge: true; insetSize: 120 |
| g12_analytics | pass | tracked: 16; events: {"homepage_hero_reviews_click":1,"homepage_hero_cta_click":2,"format_card_click":4,"dosage_guide_interaction":3,"faq_accordion_toggle":5,"reviews_gateway_click":1}; missing: []; absentEvents: [] |
| g10_links | pass | unique: ["#DandyMain","#formats","#reviews","/","/#dose","/cart","/collections/all","/pages/contact?view=dandy2-about","/pages/contact?view=dandy2-coa","/pages/contact?view=dandy2-faq","/pages/contact?view=dandy2-kratom","/pages/contact?view=dandy2-privacy","/pages/contact?view=dandy2-returns","/pages/contact?view=dandy2-shipping","/pages/contact?view=dandy2-subs","/pages/contact?view=dandy2-terms","/pages/reviews","/products/extract-capsules-50mg","/products/extract-capsules-90mg","/products/mixed-berry-kratom-gummies","/products/premium-kratom-leaf-powder","mailto:support@foreverdandy.com"]; note: resolve on the preview theme; not measurable on the static harness |
| g13_reducedMotion | pass | identicalBytes: true; heroSrcAnimated: home-hero-hands-900.webp; heroSrcReduced: home-hero-hands-900.webp |

Page errors: none

## 430px (page height 11925)

| Gate | Result | Detail |
|---|---|---|
| g4_inventory | pass | cards: ["div.hage__box","span.hero__inset","article.rev.rev--first","article.rev","article.rev","input#HomeWelcomeEmail.welcome__input"]; reviewCards: 3; offenders: []; nonButtonPills: [] |
| g9_fixedBeforeDismiss | pass | fixed: ["div.hh__nav:sticky","div.hage:fixed"]; dialogs: ["div.hage"] |
| g8_cls | pass | withGate: 0; total: 0; preload: {"present":true,"sameSet":true,"rendered":"home-hero-hands-900.webp","sizesMatch":true} |
| g9_afterDismiss | pass | dialogs: []; fixed: ["div.hh__nav:sticky"]; infiniteAnimations: []; tickerLike: [] |
| g1_overflow | pass | scrollWidth: 430; innerWidth: 430; offenders: [] |
| g2_typeFloor | pass | minFontSize: 13; minAt: p.welcome__fine; bodySize: 16; bodyParagraphsUnder16: []; metaParagraphClasses: ["welcome__fine","hf__legal","gear__range","moment__alt","hf__contact","hh__ann","dose__zone"] |
| g3_dashes | pass | count: 0 |
| g4_eyebrows | pass | offenders: [] |
| g5_whitespace | pass | limit: 56; nodes: 264; gaps: [] |
| g6_textOverPhoto | pass | overlaps: [] |
| g7_images | pass | images: [{"src":"dandy-wordmark.svg","complete":true,"natural":"300x112","attrs":"96x36","lazy":"auto","visible":true,"real":"300x112","attrsMatch":true},{"src":"dandy-wordmark.svg","complete":true,"natural":"300x112","attrs":"96x36","lazy":"auto","visible":false,"real":"300x112","attrsMatch":true},{"src":"home-hero-hands-1600.webp","complete":true,"natural":"430x241","attrs":"1600x900","lazy":"auto","visible":true,"real":"1600x900","attrsMatch":true,"candidates":["home-hero-hands-900.webp:900x506","home-hero-hands-1600.webp:1600x900"]},{"src":"home-hero-gummy-900.webp","complete":true,"natural":"900x900","attrs":"900x900","lazy":"lazy","visible":true,"real":"900x900","attrsMatch":true},{"sr |
| g11_hero | pass | h1Lines: 3; h1Size: 40; ledeLines: 4; buttonWidth: 387; contentWidth: 387; photoWidth: 430; photoHeight: 242; photoUncropped: true; photoEdgeToEdge: true; insetSize: 120 |
| g12_analytics | pass | tracked: 16; events: {"homepage_hero_reviews_click":1,"homepage_hero_cta_click":2,"format_card_click":4,"dosage_guide_interaction":3,"faq_accordion_toggle":5,"reviews_gateway_click":1}; missing: []; absentEvents: [] |
| g10_links | pass | unique: ["#DandyMain","#formats","#reviews","/","/#dose","/cart","/collections/all","/pages/contact?view=dandy2-about","/pages/contact?view=dandy2-coa","/pages/contact?view=dandy2-faq","/pages/contact?view=dandy2-kratom","/pages/contact?view=dandy2-privacy","/pages/contact?view=dandy2-returns","/pages/contact?view=dandy2-shipping","/pages/contact?view=dandy2-subs","/pages/contact?view=dandy2-terms","/pages/reviews","/products/extract-capsules-50mg","/products/extract-capsules-90mg","/products/mixed-berry-kratom-gummies","/products/premium-kratom-leaf-powder","mailto:support@foreverdandy.com"]; note: resolve on the preview theme; not measurable on the static harness |
| g13_reducedMotion | pass | identicalBytes: true; heroSrcAnimated: home-hero-hands-900.webp; heroSrcReduced: home-hero-hands-900.webp |

Page errors: none

## 768px (page height 10928)

| Gate | Result | Detail |
|---|---|---|
| g4_inventory | pass | cards: ["div.hage__box","span.hero__inset","article.rev.rev--first","article.rev","article.rev","input#HomeWelcomeEmail.welcome__input"]; reviewCards: 3; offenders: []; nonButtonPills: [] |
| g9_fixedBeforeDismiss | pass | fixed: ["div.hh__nav:sticky","div.hage:fixed"]; dialogs: ["div.hage"] |
| g8_cls | pass | withGate: 0; total: 0; preload: {"present":true,"sameSet":true,"rendered":"home-hero-hands-900.webp","sizesMatch":true} |
| g9_afterDismiss | pass | dialogs: []; fixed: ["div.hh__nav:sticky"]; infiniteAnimations: []; tickerLike: [] |
| g1_overflow | pass | scrollWidth: 768; innerWidth: 768; offenders: [] |
| g2_typeFloor | pass | minFontSize: 13; minAt: p.welcome__fine; bodySize: 16; bodyParagraphsUnder16: []; metaParagraphClasses: ["welcome__fine","hf__legal","gear__range","moment__alt","hf__contact","hh__ann","dose__zone"] |
| g3_dashes | pass | count: 0 |
| g4_eyebrows | pass | offenders: [] |
| g5_whitespace | pass | limit: 56; nodes: 259; gaps: [] |
| g6_textOverPhoto | pass | overlaps: [] |
| g7_images | pass | images: [{"src":"dandy-wordmark.svg","complete":true,"natural":"300x112","attrs":"96x36","lazy":"auto","visible":true,"real":"300x112","attrsMatch":true},{"src":"dandy-wordmark.svg","complete":true,"natural":"300x112","attrs":"96x36","lazy":"auto","visible":false,"real":"300x112","attrsMatch":true},{"src":"home-hero-hands-1600.webp","complete":true,"natural":"768x431","attrs":"1600x900","lazy":"auto","visible":true,"real":"1600x900","attrsMatch":true,"candidates":["home-hero-hands-900.webp:900x506","home-hero-hands-1600.webp:1600x900"]},{"src":"home-hero-gummy-900.webp","complete":true,"natural":"900x900","attrs":"900x900","lazy":"lazy","visible":true,"real":"900x900","attrsMatch":true},{"sr |
| g11_hero | pass | h1Lines: 3; h1Size: 41.472; ledeLines: 3; buttonWidth: 691; contentWidth: 691; photoWidth: 768; photoHeight: 432; photoUncropped: true; photoEdgeToEdge: true; insetSize: 120 |
| g12_analytics | pass | tracked: 16; events: {"homepage_hero_reviews_click":1,"homepage_hero_cta_click":2,"format_card_click":4,"dosage_guide_interaction":3,"faq_accordion_toggle":5,"reviews_gateway_click":1}; missing: []; absentEvents: [] |
| g10_links | pass | unique: ["#DandyMain","#formats","#reviews","/","/#dose","/cart","/collections/all","/pages/contact?view=dandy2-about","/pages/contact?view=dandy2-coa","/pages/contact?view=dandy2-faq","/pages/contact?view=dandy2-kratom","/pages/contact?view=dandy2-privacy","/pages/contact?view=dandy2-returns","/pages/contact?view=dandy2-shipping","/pages/contact?view=dandy2-subs","/pages/contact?view=dandy2-terms","/pages/reviews","/products/extract-capsules-50mg","/products/extract-capsules-90mg","/products/mixed-berry-kratom-gummies","/products/premium-kratom-leaf-powder","mailto:support@foreverdandy.com"]; note: resolve on the preview theme; not measurable on the static harness |
| g13_reducedMotion | pass | identicalBytes: true; heroSrcAnimated: home-hero-hands-900.webp; heroSrcReduced: home-hero-hands-900.webp |

Page errors: none

## 1280px (page height 8278)

| Gate | Result | Detail |
|---|---|---|
| g4_inventory | pass | cards: ["div.hage__box","span.hero__inset","article.rev.rev--first","article.rev","article.rev","input#HomeWelcomeEmail.welcome__input"]; reviewCards: 3; offenders: []; nonButtonPills: [] |
| g9_fixedBeforeDismiss | pass | fixed: ["div.hh__nav:sticky","div.hage:fixed"]; dialogs: ["div.hage"] |
| g8_cls | pass | withGate: 0.0248; total: 0.0248; preload: {"present":true,"sameSet":true,"rendered":"home-hero-hands-900.webp","sizesMatch":true} |
| g9_afterDismiss | pass | dialogs: []; fixed: ["div.hh__nav:sticky"]; infiniteAnimations: []; tickerLike: [] |
| g1_overflow | pass | scrollWidth: 1280; innerWidth: 1280; offenders: [] |
| g2_typeFloor | pass | minFontSize: 13; minAt: p.welcome__fine; bodySize: 17; bodyParagraphsUnder16: []; metaParagraphClasses: ["welcome__fine","hf__legal","gear__range","moment__alt","hf__contact","hh__ann","dose__zone"] |
| g3_dashes | pass | count: 0 |
| g4_eyebrows | pass | offenders: [] |
| g5_whitespace | pass | limit: 96; nodes: 269; gaps: [] |
| g6_textOverPhoto | pass | overlaps: [] |
| g7_images | pass | images: [{"src":"dandy-wordmark.svg","complete":true,"natural":"300x112","attrs":"96x36","lazy":"auto","visible":true,"real":"300x112","attrsMatch":true},{"src":"dandy-wordmark.svg","complete":true,"natural":"300x112","attrs":"96x36","lazy":"auto","visible":false,"real":"300x112","attrsMatch":true},{"src":"home-hero-hands-1600.webp","complete":true,"natural":"588x331","attrs":"1600x900","lazy":"auto","visible":true,"real":"1600x900","attrsMatch":true,"candidates":["home-hero-hands-900.webp:900x506","home-hero-hands-1600.webp:1600x900"]},{"src":"home-hero-gummy-900.webp","complete":true,"natural":"900x900","attrs":"900x900","lazy":"lazy","visible":true,"real":"900x900","attrsMatch":true},{"sr |
| g11_hero | pass | h1Lines: 3; h1Size: 66; ledeLines: 3; buttonWidth: 204; contentWidth: 1168; photoWidth: 536; photoHeight: 302; photoUncropped: true; photoEdgeToEdge: null; insetSize: 160 |
| g12_analytics | pass | tracked: 16; events: {"homepage_hero_reviews_click":1,"homepage_hero_cta_click":2,"format_card_click":4,"dosage_guide_interaction":3,"faq_accordion_toggle":5,"reviews_gateway_click":1}; missing: []; absentEvents: [] |
| g10_links | pass | unique: ["#DandyMain","#formats","#reviews","/","/#dose","/cart","/collections/all","/pages/contact?view=dandy2-about","/pages/contact?view=dandy2-coa","/pages/contact?view=dandy2-faq","/pages/contact?view=dandy2-kratom","/pages/contact?view=dandy2-privacy","/pages/contact?view=dandy2-returns","/pages/contact?view=dandy2-shipping","/pages/contact?view=dandy2-subs","/pages/contact?view=dandy2-terms","/pages/reviews","/products/extract-capsules-50mg","/products/extract-capsules-90mg","/products/mixed-berry-kratom-gummies","/products/premium-kratom-leaf-powder","mailto:support@foreverdandy.com"]; note: resolve on the preview theme; not measurable on the static harness |
| g13_reducedMotion | pass | identicalBytes: true; heroSrcAnimated: home-hero-hands-900.webp; heroSrcReduced: home-hero-hands-900.webp |

Page errors: none

## Hero composition (gate 11)

| Width | H1 lines | Lede lines | Button width | Content width | Photo height | Uncropped | Result |
|---|---|---|---|---|---|---|---|
| 375 | 3 | 5 | 335 | 335 | 211 | true | pass |
| 390 | 3 | 5 | 350 | 350 | 219 | true | pass |
| 430 | 3 | 4 | 387 | 387 | 242 | true | pass |

Screenshot duplicates: none

All gates passed.