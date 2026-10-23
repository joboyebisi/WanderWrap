# WanderWrap hackathon friction log

This log covers the Amazon and AWS developer tooling used to build WanderWrap. It intentionally excludes credentials, account identifiers and private provider responses.

## 1. Alexa+ MCP Toolkit access path

- **Task:** Install the Alexa+ MCP Toolkit CLI and deploy the self-hosted MCP server as a development add-on.
- **Steps taken:** Completed Amazon Developer registration and identity verification, followed the public quick-start, configured the documented AWS relationship, and attempted the documented package installation from the public npm registry.
- **Expected:** A public install or an early, explicit check explaining that the account needed partner enablement and private-registry access.
- **Actual:** The package returned `404` from public npm. The current setup path depends on selected-partner enablement, an Amazon-provided role and authentication to a private CodeArtifact registry.
- **Severity:** High for the official Alexa+ Web Simulator path; not a blocker for the hackathon's explicitly permitted simulated-experience path.
- **Workaround:** Built and tested the required Streamable HTTP MCP server directly, plus a clearly labelled browser simulator using the same initialize, tool-discovery, recommendation and routing sequence.
- **Suggestion:** Put an access preflight at the top of the quick-start: eligible account status, expected role name, registry URL, and the exact contact/escalation path. The CLI installer could also return an actionable enablement message instead of a registry `404`.

## 2. Account-linking redirect discovery

- **Task:** Configure OAuth 2.1 authorization-code + PKCE account linking for Alexa+.
- **Steps taken:** Deployed Cognito resource scopes and public protected-resource metadata, added multi-redirect support to infrastructure, and looked for the exact Alexa redirect URI before creating the confidential client.
- **Expected:** Stable redirect URI documentation available before the first deployment.
- **Actual:** The exact redirect is supplied during enabled add-on onboarding, creating a dependency between partner access and final identity configuration.
- **Severity:** Medium.
- **Workaround:** Parameterized the infrastructure to accept Amazon's complete comma-separated redirect list without code changes.
- **Suggestion:** Publish the redirect patterns and an OAuth metadata validator that can run before add-on creation.

## 3. MCP client compatibility evidence

- **Task:** Confirm which clients support MCP Apps UI resources and how a self-hosted server is rendered.
- **Steps taken:** Implemented protocol `2025-11-25`, Streamable HTTP, tool/resource discovery and a `ui://` MCP App resource using the official MCP Apps package.
- **Expected:** A static compatibility matrix with transport, authentication and UI-extension support separated clearly.
- **Actual:** The supported-client information was dynamic and easy to conflate with core MCP transport support.
- **Severity:** Medium.
- **Workaround:** Kept the server standards-compliant and made the adaptive UI optional; the voice-safe text/tool result remains usable when a client does not render MCP Apps.
- **Suggestion:** Provide a versioned machine-readable client matrix and a conformance command that checks transport, OAuth and UI-extension capabilities independently.

## 4. AWS cross-service configuration

- **Task:** Deploy a secure MCP/API backend with identity, persistence, observability and optional model explanations.
- **Steps taken:** Used CloudFormation for Lambda, API Gateway, Cognito, DynamoDB, CloudWatch alarms and IAM; added a GitHub OIDC deployment role and isolated CloudFormation execution role.
- **Expected:** One deployable stack and clear outputs for downstream web/Alexa configuration.
- **Actual:** The AWS services deployed reliably, but callback URLs, resource audiences, API origins and model identifiers still require careful coordination across Cognito, API Gateway, Lambda and the web host.
- **Severity:** Low to medium.
- **Workaround:** Centralized parameters in CloudFormation, documented the output-to-environment mapping and added automated authentication/origin tests.
- **Suggestion:** Offer an Alexa+ reference stack or CDK construct that emits the MCP URL, protected-resource metadata, Cognito endpoints/scopes and account-linking values as one validated bundle.

## 5. Bedrock runtime readiness

- **Task:** Add optional Amazon Bedrock explanations while preserving deterministic recommendations.
- **Steps taken:** Added the Bedrock Runtime adapter, least-privilege Lambda permissions, model/region configuration and a safe deterministic fallback.
- **Expected:** Stack deployment plus IAM configuration would be enough to know whether the selected model could be invoked.
- **Actual:** Model availability and first-use/account requirements are separate from deployment, so infrastructure success does not prove a model call.
- **Severity:** Medium.
- **Workaround:** Treat Bedrock as an optional explanation provider and expose honest fallback behaviour until a live attributed invocation is recorded.
- **Suggestion:** Add a console/CLI readiness check that validates region, model or inference-profile availability, account prerequisites and effective IAM permission in one result.
