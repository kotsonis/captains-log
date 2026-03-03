# Library Updates Proposal

We have reviewed the outdated libraries in both the `backend/` and `client/` directories using `npm outdated`.
Most of the dependencies in this project are significantly outdated and have several major versions released since they were originally added. Attempting to blindly update all of them via `npm install` or tools like `npm-check-updates` immediately causes failures due to breaking changes (for example, React 17 -> 19, React-Router 5 -> 7, AWS SDK v2 -> v3).

Here is a summary of the outdated libraries and a proposed upgrade strategy.

## Backend Dependencies

### Outdated Packages (Selection)
- `@middy/core`, `@middy/http-cors`, `@middy/http-error-handler`, `@middy/http-json-body-parser`: Currently `1.5.2` / `2.0.0` -> Latest `7.1.2`
- `aws-sdk`: Currently `2.877.0` -> Latest `2.1693.0` (Note: AWS SDK v2 is end-of-support; migration to AWS SDK v3 is strongly recommended).
- `serverless`: Currently `2.32.1` -> Latest `4.33.0`
- `typescript`: Currently `4.2.3` -> Latest `5.9.3`
- `uuid`: Currently `8.3.2` -> Latest `13.0.0`
- `axios`: Currently `0.21.1` -> Latest `1.13.6`
- `jsonwebtoken`: Currently `8.5.1` -> Latest `9.0.3`
- And various other `@types` and smaller dependencies.

### Backend Upgrade Strategy
1. **Minor/Patch updates:** Safely update to the latest minor/patch versions within the current major versions.
2. **AWS SDK Migration:** The biggest technical debt here is the `aws-sdk` v2. We should migrate the DynamoDB DocumentClient and S3 usage to `@aws-sdk/client-dynamodb`, `@aws-sdk/lib-dynamodb`, and `@aws-sdk/client-s3` (v3).
3. **Middy and Serverless:** Upgrading `@middy/*` from v1/v2 to v7, and `serverless` from v2 to v4 will likely require configuration changes in `serverless.ts` and lambda handlers.
4. **Typescript/Node:** Upgrading `typescript` and `@types/node` might highlight newer type checking rules that will need manual fixing.

---

## Client (Frontend) Dependencies

### Outdated Packages (Selection)
- `react`, `react-dom`: Currently `17.0.2` -> Latest `19.2.4`
- `react-router-dom`: Currently `5.3.4` -> Latest `7.13.1`
- `react-scripts`: Currently `4.0.3` -> Latest `5.0.1`
- `@rjsf/core`: Currently `2.5.1` -> Latest `6.3.1`
- `styled-components`: Currently `5.3.11` -> Latest `6.3.11`
- `axios`: Currently `0.21.4` -> Latest `1.13.6`
- `@testing-library/*`: Several major versions behind.

### Client Upgrade Strategy
1. **React 17 to 18 (then 19):** React 18 introduced `createRoot` for rendering. We should do a step-wise upgrade to React 18 first to ensure the application renders, then potentially to 19.
2. **React Router v5 to v6/v7:** This is a major breaking change. `<Switch>` was replaced by `<Routes>`, and route definitions changed significantly. This will require rewriting the routing logic in `App.tsx`.
3. **React-Scripts 4 to 5:** Webpack 5 was introduced in CRA 5. This might require polyfills if any node core modules are used in the browser.
4. **Testing Libraries:** Due to React 18/19 upgrades, tests will need to be migrated as well to use the new `act()` behavior and testing library upgrades.

---

## Proposal

Because simply running `npm update` or `npm-check-updates` introduces too many breaking changes across both `backend` and `client` at once (causing `npm test` to immediately fail), I recommend the following incremental approach:

1. **Phase 1: Minor/Patch Updates Only.** Update all packages to their latest safe minor/patch versions (`npm update`).
2. **Phase 2: Backend Specific Updates.** Focus on upgrading `serverless`, `@middy/*`, and migrating `aws-sdk` to v3. Ensure backend tests/deployment still work.
3. **Phase 3: Frontend Framework Updates.** Upgrade React to v18, `react-scripts` to v5, and migrate `react-router-dom` from v5 to v6. Fix UI breakages.
4. **Phase 4: Remaining Major Updates.** Upgrade remaining packages like `styled-components`, `@rjsf/core`, etc.

Please let me know if you would like me to proceed with Phase 1, or if you prefer a different approach!
