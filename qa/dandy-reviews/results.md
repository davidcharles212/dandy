# Dandy review hub QA

Ran 2026-09-12T17:48:22.902Z. Seed: 2050 reviews. Screenshots in `qa/dandy-reviews/shots/`.

| Check | 390 | 430 | 768 | 1280 |
|---|---|---|---|---|
| overflow | pass | pass | pass | pass |
| typeFloor | pass | pass | pass | pass |
| dashes | pass | pass | pass | pass |
| eyebrows | pass | pass | pass | pass |
| inventory | pass | pass | pass | pass |
| buttons | pass | pass | pass | pass |
| factsDots | pass | pass | pass | pass |
| layout | pass | pass | pass | pass |
| contrast | pass | pass | pass | pass |
| console errors | pass | pass | pass | pass |

## Behaviour (390)

| Check | Result |
|---|---|
| scorecard | pass |
| initial | pass |
| formats | pass |
| benefits | pass |
| search | pass |
| sort | pass |
| keyboard | pass |
| pdp | pass |
| stars | pass |
| errors | pass |
| deepLink | pass |
| preserveParams | pass |
| showMore | pass |
| noJs | pass |
| fetchFail | pass |
| reducedMotion | pass |
| helpful | pass |
| timing | pass |

## Details

### 390

- h1 40px, 2 lines; format row 2 rows; grid 1 columns
- rounded bordered: input.rvh__search x1, select.rvh__sort x1, article.rvh-card x20, a.btn.btn--secondary x20, button.btn.btn--secondary x1

### 430

- h1 40px, 2 lines; format row 2 rows; grid 1 columns
- rounded bordered: input.rvh__search x1, select.rvh__sort x1, article.rvh-card x20, a.btn.btn--secondary x20, button.btn.btn--secondary x1

### 768

- h1 41.472px, 2 lines; format row 1 rows; grid 2 columns
- rounded bordered: input.rvh__search x1, select.rvh__sort x1, article.rvh-card x20, a.btn.btn--secondary x20, button.btn.btn--secondary x1

### 1280

- h1 66px, 2 lines; format row 1 rows; grid 3 columns
- rounded bordered: input.rvh__search x1, select.rvh__sort x1, article.rvh-card x20, a.btn.btn--secondary x20, button.btn.btn--secondary x1

- timing at 390, CPU 4x: parse 13ms, first render 42ms, total 55ms for 2050 records (1778 KB raw); format click 9.9ms
