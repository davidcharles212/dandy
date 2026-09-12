# Dandy homepage QA results

Browser: chrome. Harness: qa/dandy-home/harness.html rendered from layout/dandy-home.liquid and sections/dandy-home.liquid (cart drawer stubbed). Screenshots in qa/dandy-home/shots/ (not committed). Gates 6, 8 and 10 are informational here: 6 reports overlaps only, 8 measures CLS on the static harness, 10 lists hrefs for the preview-theme check.

## 390px (page height 12441)

| Gate | Result | Detail |
|---|---|---|
| g4_inventory | pass | cards: ["div.hage__box","div.ugc__frame","button.ugc__play","div.ugc__frame","button.ugc__play","div.ugc__frame","button.ugc__play","div.ugc__frame","button.ugc__play","article.rev.rev--first","article.rev","article.rev","input#HomeWelcomeEmail.welcome__input"]; reviewCards: 3; offenders: []; nonButtonPills: [] |
| g9_fixedBeforeDismiss | pass | fixed: ["div.hh__nav:sticky","div.hage:fixed"]; dialogs: ["div.hage"] |
| g8_cls | pass | withGate: 0; total: 0; preload: {"present":true,"sameSet":true,"rendered":"home-hero-lineup-phone-900.webp","sizesMatch":true} |
| g9_afterDismiss | pass | dialogs: []; fixed: ["div.hh__nav:sticky"]; infiniteAnimations: []; tickerLike: [] |
| g1_overflow | pass | scrollWidth: 390; innerWidth: 390; offenders: [] |
| g2_typeFloor | pass | minFontSize: 13; minAt: p.welcome__fine; bodySize: 16; bodyParagraphsUnder16: []; metaParagraphClasses: ["welcome__fine","hf__legal","gear__range","fmt__alt","hf__contact","hh__ann","ugc__q"] |
| g3_dashes | pass | count: 0 |
| g4_eyebrows | pass | offenders: [] |
| g5_whitespace | pass | limit: 56; nodes: 272; gaps: [] |
| g6_textOverPhoto | pass | overlaps: [] |
| g7_images | pass | images: [{"src":"dandy-wordmark.svg","complete":true,"natural":"300x112","attrs":"96x36","lazy":"auto","visible":true,"real":"300x112","attrsMatch":true},{"src":"dandy-wordmark.svg","complete":true,"natural":"300x112","attrs":"96x36","lazy":"auto","visible":false,"real":"300x112","attrsMatch":true},{"src":"home-hero-lineup-1800.webp","complete":true,"natural":"390x219","attrs":"1800x1200","lazy":"auto","visible":true,"real":"1800x1200","attrsMatch":true,"candidates":["home-hero-lineup-900.webp:900x600","home-hero-lineup-1800.webp:1800x1200"]},{"src":"home-lineup-gummies-1000.webp","complete":true,"natural":"1000x1000","attrs":"1000x1000","lazy":"lazy","visible":true,"real":"1000x1000","attrs |
| g11_hero | pass | h1Lines: 3; h1Size: 35.88; ledeLines: 5; buttonWidth: 350; contentWidth: 350; primaryButtonBottom: 785; firstScreen: true; photoWidth: 390; photoHeight: 219; photoUncropped: true; photoEdgeToEdge: true; insetSize: null |
| g12_analytics | pass | tracked: 20; events: {"homepage_hero_cta_click":1,"format_card_click":4,"ugc_play":4,"coa_link_click":1,"review_filter_click":4,"reviews_gateway_click":1,"faq_accordion_toggle":5}; missing: []; absentEvents: [] |
| g10_links | pass | unique: ["#DandyMain","#lineup","/","/#dose","/cart","/collections/all","/pages/contact?view=dandy2-about","/pages/contact?view=dandy2-coa","/pages/contact?view=dandy2-faq","/pages/contact?view=dandy2-kratom","/pages/contact?view=dandy2-privacy","/pages/contact?view=dandy2-returns","/pages/contact?view=dandy2-shipping","/pages/contact?view=dandy2-subs","/pages/contact?view=dandy2-terms","/pages/contact?view=reviews","/pages/contact?view=reviews&format=capsules","/pages/contact?view=reviews&format=gummies","/pages/contact?view=reviews&format=powder","/products/extract-capsules-50mg","/products/extract-capsules-90mg","/products/mixed-berry-kratom-gummies","/products/premium-kratom-leaf-powder" |
| g13_reducedMotion | pass | identicalBytes: true; imageRectsIdentical: true; images: 11; heroSrcAnimated: home-hero-lineup-phone-900.webp; heroSrcReduced: home-hero-lineup-phone-900.webp |

Page errors: none

## 430px (page height 12284)

| Gate | Result | Detail |
|---|---|---|
| g4_inventory | pass | cards: ["div.hage__box","div.ugc__frame","button.ugc__play","div.ugc__frame","button.ugc__play","div.ugc__frame","button.ugc__play","div.ugc__frame","button.ugc__play","article.rev.rev--first","article.rev","article.rev","input#HomeWelcomeEmail.welcome__input"]; reviewCards: 3; offenders: []; nonButtonPills: [] |
| g9_fixedBeforeDismiss | pass | fixed: ["div.hh__nav:sticky","div.hage:fixed"]; dialogs: ["div.hage"] |
| g8_cls | pass | withGate: 0; total: 0; preload: {"present":true,"sameSet":true,"rendered":"home-hero-lineup-phone-900.webp","sizesMatch":true} |
| g9_afterDismiss | pass | dialogs: []; fixed: ["div.hh__nav:sticky"]; infiniteAnimations: []; tickerLike: [] |
| g1_overflow | pass | scrollWidth: 430; innerWidth: 430; offenders: [] |
| g2_typeFloor | pass | minFontSize: 13; minAt: p.welcome__fine; bodySize: 16; bodyParagraphsUnder16: []; metaParagraphClasses: ["welcome__fine","hf__legal","gear__range","fmt__alt","hf__contact","hh__ann","ugc__q"] |
| g3_dashes | pass | count: 0 |
| g4_eyebrows | pass | offenders: [] |
| g5_whitespace | pass | limit: 56; nodes: 272; gaps: [] |
| g6_textOverPhoto | pass | overlaps: [] |
| g7_images | pass | images: [{"src":"dandy-wordmark.svg","complete":true,"natural":"300x112","attrs":"96x36","lazy":"auto","visible":true,"real":"300x112","attrsMatch":true},{"src":"dandy-wordmark.svg","complete":true,"natural":"300x112","attrs":"96x36","lazy":"auto","visible":false,"real":"300x112","attrsMatch":true},{"src":"home-hero-lineup-1800.webp","complete":true,"natural":"430x241","attrs":"1800x1200","lazy":"auto","visible":true,"real":"1800x1200","attrsMatch":true,"candidates":["home-hero-lineup-900.webp:900x600","home-hero-lineup-1800.webp:1800x1200"]},{"src":"home-lineup-gummies-1000.webp","complete":true,"natural":"1000x1000","attrs":"1000x1000","lazy":"lazy","visible":true,"real":"1000x1000","attrs |
| g11_hero | pass | h1Lines: 3; h1Size: 39.56; ledeLines: 4; buttonWidth: 387; contentWidth: 387; primaryButtonBottom: 796; firstScreen: true; photoWidth: 430; photoHeight: 242; photoUncropped: true; photoEdgeToEdge: true; insetSize: null |
| g12_analytics | pass | tracked: 20; events: {"homepage_hero_cta_click":1,"format_card_click":4,"ugc_play":4,"coa_link_click":1,"review_filter_click":4,"reviews_gateway_click":1,"faq_accordion_toggle":5}; missing: []; absentEvents: [] |
| g10_links | pass | unique: ["#DandyMain","#lineup","/","/#dose","/cart","/collections/all","/pages/contact?view=dandy2-about","/pages/contact?view=dandy2-coa","/pages/contact?view=dandy2-faq","/pages/contact?view=dandy2-kratom","/pages/contact?view=dandy2-privacy","/pages/contact?view=dandy2-returns","/pages/contact?view=dandy2-shipping","/pages/contact?view=dandy2-subs","/pages/contact?view=dandy2-terms","/pages/contact?view=reviews","/pages/contact?view=reviews&format=capsules","/pages/contact?view=reviews&format=gummies","/pages/contact?view=reviews&format=powder","/products/extract-capsules-50mg","/products/extract-capsules-90mg","/products/mixed-berry-kratom-gummies","/products/premium-kratom-leaf-powder" |
| g13_reducedMotion | pass | identicalBytes: true; imageRectsIdentical: true; images: 11; heroSrcAnimated: home-hero-lineup-phone-900.webp; heroSrcReduced: home-hero-lineup-phone-900.webp |

Page errors: none

## 768px (page height 8149)

| Gate | Result | Detail |
|---|---|---|
| g4_inventory | pass | cards: ["div.hage__box","div.ugc__frame","button.ugc__play","div.ugc__frame","button.ugc__play","div.ugc__frame","button.ugc__play","div.ugc__frame","button.ugc__play","article.rev.rev--first","article.rev","article.rev","input#HomeWelcomeEmail.welcome__input"]; reviewCards: 3; offenders: []; nonButtonPills: [] |
| g9_fixedBeforeDismiss | pass | fixed: ["div.hh__nav:sticky","div.hage:fixed"]; dialogs: ["div.hage"] |
| g8_cls | pass | withGate: 0; total: 0; preload: {"present":true,"sameSet":true,"rendered":"home-hero-lineup-phone-900.webp","sizesMatch":true} |
| g9_afterDismiss | pass | dialogs: []; fixed: ["div.hh__nav:sticky"]; infiniteAnimations: []; tickerLike: [] |
| g1_overflow | pass | scrollWidth: 768; innerWidth: 768; offenders: [] |
| g2_typeFloor | pass | minFontSize: 13; minAt: p.welcome__fine; bodySize: 16; bodyParagraphsUnder16: []; metaParagraphClasses: ["welcome__fine","hf__legal","gear__range","fmt__alt","hf__contact","hh__ann","ugc__q"] |
| g3_dashes | pass | count: 0 |
| g4_eyebrows | pass | offenders: [] |
| g5_whitespace | pass | limit: 56; nodes: 266; gaps: [] |
| g6_textOverPhoto | pass | overlaps: [] |
| g7_images | pass | images: [{"src":"dandy-wordmark.svg","complete":true,"natural":"300x112","attrs":"96x36","lazy":"auto","visible":true,"real":"300x112","attrsMatch":true},{"src":"dandy-wordmark.svg","complete":true,"natural":"300x112","attrs":"96x36","lazy":"auto","visible":false,"real":"300x112","attrsMatch":true},{"src":"home-hero-lineup-1800.webp","complete":true,"natural":"768x431","attrs":"1800x1200","lazy":"auto","visible":true,"real":"1800x1200","attrsMatch":true,"candidates":["home-hero-lineup-900.webp:900x600","home-hero-lineup-1800.webp:1800x1200"]},{"src":"home-lineup-gummies-1000.webp","complete":true,"natural":"1000x1000","attrs":"1000x1000","lazy":"lazy","visible":true,"real":"1000x1000","attrs |
| g11_hero | pass | h1Lines: 3; h1Size: 66; ledeLines: 3; buttonWidth: 691; contentWidth: 691; primaryButtonBottom: 983; firstScreen: true; photoWidth: 768; photoHeight: 432; photoUncropped: true; photoEdgeToEdge: true; insetSize: null |
| g12_analytics | pass | tracked: 20; events: {"homepage_hero_cta_click":1,"format_card_click":4,"ugc_play":4,"coa_link_click":1,"review_filter_click":4,"reviews_gateway_click":1,"faq_accordion_toggle":5}; missing: []; absentEvents: [] |
| g10_links | pass | unique: ["#DandyMain","#lineup","/","/#dose","/cart","/collections/all","/pages/contact?view=dandy2-about","/pages/contact?view=dandy2-coa","/pages/contact?view=dandy2-faq","/pages/contact?view=dandy2-kratom","/pages/contact?view=dandy2-privacy","/pages/contact?view=dandy2-returns","/pages/contact?view=dandy2-shipping","/pages/contact?view=dandy2-subs","/pages/contact?view=dandy2-terms","/pages/contact?view=reviews","/pages/contact?view=reviews&format=capsules","/pages/contact?view=reviews&format=gummies","/pages/contact?view=reviews&format=powder","/products/extract-capsules-50mg","/products/extract-capsules-90mg","/products/mixed-berry-kratom-gummies","/products/premium-kratom-leaf-powder" |
| g13_reducedMotion | pass | identicalBytes: true; imageRectsIdentical: true; images: 11; heroSrcAnimated: home-hero-lineup-phone-900.webp; heroSrcReduced: home-hero-lineup-phone-900.webp |

Page errors: none

## 1280px (page height 7666)

| Gate | Result | Detail |
|---|---|---|
| g4_inventory | pass | cards: ["div.hage__box","div.ugc__frame","button.ugc__play","div.ugc__frame","button.ugc__play","div.ugc__frame","button.ugc__play","div.ugc__frame","button.ugc__play","article.rev.rev--first","article.rev","article.rev","input#HomeWelcomeEmail.welcome__input"]; reviewCards: 3; offenders: []; nonButtonPills: [] |
| g9_fixedBeforeDismiss | pass | fixed: ["div.hh__nav:sticky","div.hage:fixed"]; dialogs: ["div.hage"] |
| g8_cls | pass | withGate: 0.0071; total: 0.0071; preload: {"present":true,"sameSet":true,"rendered":"home-hero-lineup-900.webp","sizesMatch":true} |
| g9_afterDismiss | pass | dialogs: []; fixed: ["div.hh__nav:sticky"]; infiniteAnimations: []; tickerLike: [] |
| g1_overflow | pass | scrollWidth: 1280; innerWidth: 1280; offenders: [] |
| g2_typeFloor | pass | minFontSize: 13; minAt: p.welcome__fine; bodySize: 17; bodyParagraphsUnder16: []; metaParagraphClasses: ["welcome__fine","hf__legal","gear__range","fmt__alt","hf__contact","hh__ann","ugc__q"] |
| g3_dashes | pass | count: 0 |
| g4_eyebrows | pass | offenders: [] |
| g5_whitespace | pass | limit: 96; nodes: 276; gaps: [] |
| g6_textOverPhoto | pass | overlaps: [] |
| g7_images | pass | images: [{"src":"dandy-wordmark.svg","complete":true,"natural":"300x112","attrs":"96x36","lazy":"auto","visible":true,"real":"300x112","attrsMatch":true},{"src":"dandy-wordmark.svg","complete":true,"natural":"300x112","attrs":"96x36","lazy":"auto","visible":false,"real":"300x112","attrsMatch":true},{"src":"home-hero-lineup-1800.webp","complete":true,"natural":"588x392","attrs":"1800x1200","lazy":"auto","visible":true,"real":"1800x1200","attrsMatch":true,"candidates":["home-hero-lineup-900.webp:900x600","home-hero-lineup-1800.webp:1800x1200"]},{"src":"home-lineup-gummies-1000.webp","complete":true,"natural":"1000x1000","attrs":"1000x1000","lazy":"lazy","visible":true,"real":"1000x1000","attrs |
| g11_hero | pass | h1Lines: 3; h1Size: 66; ledeLines: 4; buttonWidth: 236; contentWidth: 1168; primaryButtonBottom: 572; firstScreen: true; photoWidth: 536; photoHeight: 357; photoUncropped: true; photoEdgeToEdge: null; insetSize: null |
| g12_analytics | pass | tracked: 20; events: {"homepage_hero_cta_click":1,"format_card_click":4,"ugc_play":4,"coa_link_click":1,"review_filter_click":4,"reviews_gateway_click":1,"faq_accordion_toggle":5}; missing: []; absentEvents: [] |
| g10_links | pass | unique: ["#DandyMain","#lineup","/","/#dose","/cart","/collections/all","/pages/contact?view=dandy2-about","/pages/contact?view=dandy2-coa","/pages/contact?view=dandy2-faq","/pages/contact?view=dandy2-kratom","/pages/contact?view=dandy2-privacy","/pages/contact?view=dandy2-returns","/pages/contact?view=dandy2-shipping","/pages/contact?view=dandy2-subs","/pages/contact?view=dandy2-terms","/pages/contact?view=reviews","/pages/contact?view=reviews&format=capsules","/pages/contact?view=reviews&format=gummies","/pages/contact?view=reviews&format=powder","/products/extract-capsules-50mg","/products/extract-capsules-90mg","/products/mixed-berry-kratom-gummies","/products/premium-kratom-leaf-powder" |
| g13_reducedMotion | FAIL | identicalBytes: false; imageRectsIdentical: true; images: 11; heroSrcAnimated: home-hero-lineup-900.webp; heroSrcReduced: home-hero-lineup-900.webp; differing: 28; total: 9812480; firstRow: 5541; lastRow: 5582 |

Page errors: none

## Hero composition (gate 11)

| Width | H1 lines | Lede lines | Button width | Content width | Primary button bottom (viewport) | Photo height | Uncropped | Result |
|---|---|---|---|---|---|---|---|---|
| 375 | 3 | 5 | 335 | 335 | 773 (844) | 211 | true | pass |
| 390 | 3 | 5 | 350 | 350 | 785 (844) | 219 | true | pass |
| 430 | 3 | 4 | 387 | 387 | 796 (844) | 242 | true | pass |

Screenshot duplicates: none

Some gates failed.