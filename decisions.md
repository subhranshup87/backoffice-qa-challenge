# Decisions

## Test strategy, and why the work was split across end-to-end, component and unit layers the way it was
I focused mainly on api testing using playwright request context as give faster and reliable feedback. I followed risk based testing approach and choose to automate payout module as it is highest business impactful area. I performed explorartory testing on UI to understand the workflow and finding defects.

## What was deliberately not tested, and why
I did not cover extensive UI testing as I focused on core business funtionality by testing APIs.

## How the defects found were prioritised
I prioritised defects based on business impact. I marked all the incorrect payout issues as High.

## Which defect was fixed, and why that one
I fixed the repeated payout approval issue because it could result in duplicate withdrawals. It has the highest business risk.

## Where AI assistance was used
I used AI assistance to discuss the testing approach and prioritise test coverage. I also used Playwright code generation as a starting point for some automation.Then I reviewed and modified the generated code manually.

## What another four hours would go to
I would do more API tests and end to end coverage around limits, transaction history.Also would like to do negative and boundary tessting.

## The CI quality gate you would add, and why
I would add playwright api tests in CI which will prevent regressions and give confident about build.

## The automated check that would catch a hollow, AI-generated test suite
I would intentionally break actual functionality and check whether the automated tests catch it. If they don't fail, the test suite is not providing much value.