# CMinds x Trustless Work

## Product Requirements Draft — Coastal Communities Escrow Pilot v1

**Version:** Draft v0.1

**Purpose:** Requirements draft for the first working pilot version

**Target:** Something demonstrable to coastal communities within approximately 15 days

**Product Type:** Role-based escrow pilot for community-led coastal conservation tasks

**Primary Infrastructure:** Trustless Work escrow infrastructure on Stellar

**Primary Asset:** USDC

**Wallet for Demo:** Freighter

UX Bounty Briefs — Coastal Communities Escrow Pilot v1

---

# 1. Executive Summary

CMinds and Trustless Work will build a first simple version of a coastal communities escrow pilot. The goal of v1 is to create something concrete that can be shown to communities within approximately 15 days.

The pilot will allow a coastal community or community implementer to create an escrow-based funding request by selecting tasks from a predefined menu, assigning milestone amounts, submitting evidence, and updating milestone status.

CMinds will review and approve milestones through its dashboard. Funders will be able to contribute USDC to initialized escrow contracts. Community leaders or trusted community representatives will be able to manually release funds per milestone after approval.

The product is not intended to be a complete grant management system in v1. It is intended to validate the workflow, demonstrate the role-based escrow model, and give CMinds something tangible to test with communities.

---

# 2. Product Goal

The goal of v1 is to demonstrate a simple, usable flow where:

1. A community creates and initializes an escrow directly from the Community Dashboard.
2. The community selects predefined tasks from an approved menu.
3. Each selected task becomes a milestone.
4. The community assigns a fixed amount to each milestone.
5. Once initialized, the escrow receives a contract address and can receive USDC funding.
6. One or multiple funders can fund the escrow with USDC.
7. The community submits milestone evidence.
8. CMinds reviews milestone evidence and approves or disputes the milestone.
9. The community leader or trusted release signer manually releases funds per approved milestone.
10. Funders and interested parties can view public progress through a transparency page.

---

# 3. Strategic Context

Foundations and funders often route capital through intermediary organizations before funds reach local communities. These intermediaries provide trust, reporting, oversight, and local legitimacy, but they can also add friction, opacity, delays, and dependency.

CMinds is exploring whether programmable escrow infrastructure can create a more transparent and direct funding path for coastal communities without removing necessary oversight.

The first pilot should show how communities can participate directly in funding workflows while CMinds retains review, approval, and dispute-resolution authority.

The pilot should not claim to eliminate all intermediaries. Instead, it should demonstrate how parts of the funding coordination process can become more transparent, auditable, and role-based.

---

# 4. Source Model

The uploaded Vital Oceans / CMinds agreement template defines the base operating model for this pilot:

- A **Community Implementer** may be an individual or community collective.
- A **Funding Entity** may be Vital Oceans / CMinds, a donor, philanthropist, or development bank.
- The community selects tasks from a fixed **Available Task Menu**.
- Each task has a unique code, category, task description, and expected deliverable.
- Funds are released progressively, milestone by milestone.
- The Community Implementer submits deliverables before disbursement is authorized.
- The Funding Entity or platform verifies completion before releasing funds.
- If a milestone is not completed by the agreed deadline, the next disbursement is frozen.
- Verification evidence may include photos, videos, meeting minutes, attendance lists, official documents, reports, proof of payment, receipts, or other agreed evidence.

This product should translate that agreement model into a lightweight escrow-based application.

---

# 5. v1 Product Scope

## 5.1 Included in v1

The first version should include:

1. Community Dashboard
2. CMinds Dashboard
3. Funding / Escrow Detail Page
4. Public Transparency Viewer
5. Wallet connection using Freighter
6. Escrow creation / initialization flow
7. Fixed task menu selection
8. Milestone generation from selected tasks
9. Fixed milestone amounts set by the community
10. Evidence links for milestone updates
11. CMinds milestone approval / dispute flow
12. Manual release per milestone by release signer
13. Multiple funders per escrow
14. Direct wallet funding and escrow address display
15. Shortened wallet addresses in public views
16. Admin pause/cancel flow
17. Support for testnet or mainnet through environment configuration

## 5.2 Excluded from v1

The first version should not attempt to include:

1. Full grant management platform
2. Full donor CRM
3. Advanced reporting analytics
4. Legal/compliance automation
5. KYC/KYB workflows
6. Wallet abstraction
7. Direct fiat on-ramp/off-ramp
8. Advanced identity verification
9. Complex multi-organization permissions
10. Fully automated milestone approval
11. Full file upload infrastructure unless fast to implement
12. Complex request-change workflow inside the app
13. Production-grade privacy controls
14. Mobile-native application
15. Multi-language polished UX

---

# 6. User Roles

## 6.1 Community Implementer

The Community Implementer may be an individual, community collective, local organization, NGO, union, or other trusted beneficiary.

Responsibilities:

- Create escrow with milestones.
- Select tasks from fixed menu.
- Define milestone amounts.
- Add project details.
- Submit evidence links.
- Mark milestone as ready for review.
- Receive funds if configured as receiver.
- Potentially sign release if also assigned as release signer.

## 6.2 Community Leader / Release Signer

The Release Signer is likely a community leader or trusted representative.

Responsibilities:

- Connect wallet.
- View releasable milestones.
- Confirm approved milestone.
- Manually sign release transaction.
- Release funds per milestone.

For the pilot, the Release Signer may also be the Receiver.

## 6.3 CMinds

CMinds acts as the first platform operator, milestone approver, and dispute resolver.

Responsibilities:

- Monitor initialized escrows.
- Review evidence submitted by communities.
- Approve or dispute milestones.
- Dispute or cancel escrows through admin flow when needed.
- Monitor active escrow status, funding status, and release history.
- Support funder visibility.
- Eventually support scalability to other foundations or trusted evaluators.

## 6.4 Funder / Depositor

The Funder can be any wallet that deposits USDC into the escrow.

Responsibilities:

- View funding page.
- Connect wallet and fund directly, if desired.
- Copy escrow address and fund externally, if desired.
- Monitor funding and milestone progress.

The funding party does not need to be hardcoded because an initialized escrow can receive funds from multiple wallets.

## 6.5 Observer / Interested Party

Observers may include funders, foundations, SDF, community stakeholders, or interested public parties.

Responsibilities:

- View public transparency page.
- See escrow status.
- See task/milestone progress.
- See funded and released amounts.
- See shortened wallet addresses.
- Review public evidence links where available.

## 6.6 Trustless Work

Trustless Work provides infrastructure and implementation.

Responsibilities:

- Provide escrow infrastructure.
- Build the pilot application.
- Integrate wallet-based role discovery.
- Support escrow creation, funding, milestone updates, approvals, disputes, and releases.
- Provide product/design/build support.

Trustless Work is never custodian of funds.

---

# 7. Role Mapping to Trustless Work Escrow Roles

| Trustless Work Role | v1 Actor                                    |
| ------------------- | ------------------------------------------- |
| Escrow Initializer  | Community Implementer / Community Dashboard |
| Funder / Depositor  | Any wallet                                  |
| Milestone Marker    | Community Implementer                       |
| Milestone Approver  | CMinds                                      |
| Release Signer      | Community Leader / Trusted Representative   |
| Dispute Resolver    | CMinds                                      |
| Receiver            | Configurable per escrow or per milestone    |
| Platform Address    | CMinds / Platform admin role                |
| Observer            | Funders, foundations, interested parties    |

---

# 8. Core Product Flows

## 8.1 Community Creates and Initializes Escrow

1. Community user connects Freighter wallet.
2. Community opens Community Dashboard.
3. User starts a new escrow creation flow.
4. User enters project details.
5. User selects tasks from fixed task menu.
6. User assigns fixed amount to each selected task/milestone.
7. User adds deadline and optional details.
8. User selects receiver or beneficiary details.
9. User initializes the escrow directly.
10. Once initialized, escrow has a contract address and can receive funds.

Important: communities should not freely invent arbitrary tasks except through the available `X-01 Custom Task` option.

Important rule:

> Escrows cannot be funded if they are not initialized.

## 8.2 Escrow Funding

1. Initialized escrow has contract address.
2. Funding page displays escrow address.
3. Funding page allows direct wallet funding if available.
4. Funding page also allows funders to copy address and fund externally.
5. Multiple wallets can fund the same escrow.
6. Funding page shows funding status.

The funder identity is not a blocking requirement for v1. The contract address can receive funds from any wallet.

## 8.3 Community Updates Milestone

1. Community opens active escrow.
2. Community selects milestone.
3. Community adds evidence links.
4. Evidence may include receipts, photos, attendee lists, reports, documents, or other task-specific deliverables.
5. Community marks milestone as ready for review.
6. Milestone status updates for CMinds review.

## 8.4 CMinds Approves or Disputes Milestone

1. CMinds opens review dashboard.
2. CMinds sees milestones ready for review.
3. CMinds reviews evidence.
4. CMinds approves or disputes the milestone.
5. If disputed, milestone remains unreleased.
6. Request-change communication may happen off-platform for v1, such as through email.

## 8.5 Release Signer Releases Funds Per Milestone

1. Community leader / release signer connects wallet.
2. Community Dashboard shows approved milestones ready for release.
3. Release signer reviews amount and receiver.
4. Release signer manually signs release transaction.
5. Funds are released for that milestone.
6. Release history updates on dashboard and transparency viewer.

Important requirements:

- Releases happen per milestone.
- Releases are manual.
- Releases are signed by the release signer.
- Receiver can be configurable.
- Per-milestone receiver is allowed.
- For the pilot, release signer may also be receiver.

## 8.6 Public Transparency Viewer

1. Public or shareable page displays escrow summary.
2. Viewer shows selected tasks/milestones.
3. Viewer shows milestone status.
4. Viewer shows funded amount and released amount.
5. Viewer shows shortened wallet addresses.
6. Viewer shows evidence links if provided.
7. Viewer shows approval and release history.

For v1, the viewer is public-facing. Privacy rules can be refined later.

---

# 9. Fixed Task Menu

The Community Dashboard should present the Available Task Menu as a multiple-selection list.

Each selected task becomes a milestone.

The task menu comes from the Vital Oceans / CMinds agreement template.

## 9.1 Management & Coordination

| Code | Task                            | Expected Deliverable                                       |
| ---- | ------------------------------- | ---------------------------------------------------------- |
| G-01 | Hiring a campaign coordinator   | Signed contract and documentation of the selection process |
| G-02 | Coordination team meeting       | Attendance list and minutes with agreed actions            |
| G-03 | Development of a work plan      | Approved plan with schedule and defined milestones         |
| G-04 | Progress report to the platform | Monthly or bimonthly report as agreed                      |

## 9.2 Community Participation

| Code | Task                                | Expected Deliverable                                   |
| ---- | ----------------------------------- | ------------------------------------------------------ |
| C-01 | Community assembly or meeting       | Attendance list, minutes, and photographic record      |
| C-02 | Training workshop for the community | Attendance list, materials distributed, and evaluation |
| C-03 | Community consultation or survey    | Response database and analysis of results              |
| C-04 | Formal community agreement          | Document signed by community leaders or assembly       |

## 9.3 Advocacy & Policy

| Code | Task                                                           | Expected Deliverable                               |
| ---- | -------------------------------------------------------------- | -------------------------------------------------- |
| I-01 | Meeting with local authorities                                 | Minutes or summary with commitments obtained       |
| I-02 | Travel to the capital for meetings with government authorities | Trip report, contacts made, and agreements reached |
| I-03 | Presentation before a government body                          | Presentation used and record of the session        |
| I-04 | Submission of formal letter or proposal to government          | Copy of the letter and acknowledgment of receipt   |
| I-05 | Participation in a public hearing                              | Record of participation and contribution presented |

## 9.4 Information Production

| Code | Task                                            | Expected Deliverable                                       |
| ---- | ----------------------------------------------- | ---------------------------------------------------------- |
| D-01 | Marine or coastal ecosystem monitoring          | Dataset with records and documented methodology            |
| D-02 | Participatory mapping                           | Digital or printed map validated by the community          |
| D-03 | Systematization of traditional knowledge        | Document or report of local knowledge                      |
| D-04 | Technical proposal for a protected area or OECM | Draft with coordinates, justification, and management plan |

## 9.5 Communications & Visibility

| Code | Task                             | Expected Deliverable                         |
| ---- | -------------------------------- | -------------------------------------------- |
| K-01 | Local communications campaign    | Content produced and reach metrics           |
| K-02 | Production of outreach materials | Printed or digital materials delivered       |
| K-03 | Media coverage or press release  | Link or clipping of the publication obtained |

## 9.6 Custom Task

| Code | Task        | Expected Deliverable                |
| ---- | ----------- | ----------------------------------- |
| X-01 | Custom Task | Deliverable defined in the contract |

`X-01 Custom Task` should be available in v1.

---

# 10. Milestone Requirements

## 10.1 Milestone Creation

Milestones are created from selected task menu items.

Each milestone should include:

- Task code
- Task category
- Task name
- Expected deliverable
- Deadline
- Fixed amount
- Receiver
- Release signer
- Evidence field
- Status

## 10.2 Milestone Amounts

The community sets the amount per milestone.

Amounts are fixed, not percentage-based.

## 10.3 Milestone Count

The number of milestones is flexible.

The number of rows should adjust dynamically based on the number of selected tasks, consistent with the agreement template model.

## 10.4 Milestone Sequence

Milestones are non-sequential.

Trustless Work should support approval and release of milestones independently.

## 10.5 Milestone Editing Rules

- Platform address can add milestones.
- A milestone cannot be edited once its status has been updated.
- Request changes may happen off-platform for v1.

## 10.6 Milestone Evidence

Evidence is submitted as part of the milestone update.

For v1, evidence can be links.

Possible evidence types:

- Receipt image link
- Photo evidence link
- Attendee list link
- Meeting minutes link
- Report link
- Dataset link
- Map link
- Government letter link
- Media clipping link

Direct uploads may be considered if simple, potentially using Supabase or similar storage and storing the resulting URL in escrow metadata.

---

# 11. Funding Requirements

## 11.1 Funding Asset

The pilot uses USDC.

## 11.2 Funding Page

The funding page should support both:

1. Direct wallet funding from the page.
2. Display/copy escrow contract address for external funding.

## 11.3 Multiple Funders

Multiple wallets may fund the same escrow.

The application does not need to require a single funder identity in v1.

## 11.4 Funding State

An escrow can only be funded after it has been initialized.

Before initialization, the project can exist as a request or draft, but it should not be treated as a fundable escrow.

---

# 12. Approval and Dispute Requirements

## 12.1 CMinds Approval

CMinds approves milestones in v1.

Approval is based on evidence provided by the community.

## 12.2 Dispute

CMinds can dispute milestones.

Dispute criteria may be subjective and defined by CMinds, including bad execution, lack of trust, invalid evidence, or other concerns.

## 12.3 Pause / Cancel

Pause/cancel should be implemented as an admin flow in v1.

The exact operational criteria are owned by CMinds.

## 12.4 Request Changes

Request-change workflows are not required in-app for v1.

They can happen through email or other off-platform communication.

---

# 13. Release Requirements

## 13.1 Release Type

Funds are released per milestone.

## 13.2 Release Execution

Release is manual.

## 13.3 Release Signer

The release signer is likely the community leader or trusted community representative.

## 13.4 Receiver

Receiver is configurable.

Receiver can be:

- Community leader
- Community implementer
- Trusted beneficiary
- NGO
- Union
- Local organization
- Other project wallet

Per-milestone receiver is supported.

For the pilot, the release signer may also be the receiver.

---

# 14. Interface Requirements

## 14.1 Community Dashboard

The Community Dashboard should support:

- Wallet login with Freighter
- View community-related escrows
- Create escrow request
- Select tasks from fixed menu
- Use `X-01 Custom Task`
- Add project metadata
- Set milestone fixed amounts
- Set milestone deadlines
- Add receiver details
- Submit evidence links
- Mark milestone as ready for review
- See approval/dispute state
- See funded/released status
- Sign release if connected wallet is release signer

## 14.2 CMinds Dashboard

The CMinds Dashboard should support:

- Wallet login
- View proposed escrow requests
- View initialized escrows
- Review selected tasks
- Review milestone amounts
- Review evidence links
- Approve milestone
- Dispute milestone
- Admin pause/cancel flow
- Add milestones through platform address
- View funding status
- View release history
- Support funder-facing visibility

## 14.3 Funding / Escrow Detail Page

The funding page should support:

- Public or shareable escrow page
- Escrow title and description
- Escrow contract address
- Copy address
- Direct wallet funding
- Funding progress
- Funded amount
- Released amount
- Milestone list
- Shortened wallet addresses

## 14.4 Public Transparency Viewer

The transparency viewer should support:

- Public access
- Selected task list
- Milestone status
- Evidence links
- Funded amount
- Released amount
- Shortened wallet addresses
- Approval/release history
- Community/project summary

---

# 15. Technical Requirements

## 15.1 Wallet

V1 demo uses Freighter.

Wallet abstraction is not required in v1.

## 15.2 Network

The application should support switching between testnet and mainnet through configuration.

From Trustless Work’s perspective, moving from testnet to mainnet is primarily an API URL and API key change.

## 15.3 API Requirements

The product should rely on Trustless Work API capabilities, including:

- Create escrow
- Initialize escrow
- Get escrows by role
- Update milestone status
- Approve milestone
- Dispute milestone
- Release milestone funds
- Read escrow status
- Read funded/released amounts

## 15.4 Evidence Storage

V1 supports evidence links.

Direct upload may be considered if feasible, using storage such as Supabase and saving evidence URLs in escrow metadata.

## 15.5 Address Display

Public views should show shortened wallet addresses.

Full wallet addresses may be available through copy or explorer links if needed.

---

# 16. Data Requirements

## 16.1 Project / Escrow Metadata

Required fields:

- Project name
- Community name
- Geographic area
- Description
- Protection designation, if applicable
- Contract duration
- Community implementer
- Primary contact
- Contact email or WhatsApp
- Receiver wallet
- Release signer wallet
- CMinds approver wallet
- Dispute resolver wallet
- Selected tasks
- Milestones
- Total amount
- Visibility status

## 16.2 Milestone Data

Required fields:

- Milestone number
- Task code
- Category
- Task name
- Expected deliverable
- Deadline
- Fixed amount
- Receiver
- Status
- Evidence links
- Approval status
- Release status

## 16.3 Funding Data

Required fields:

- Escrow contract address
- Asset
- Funded amount
- Funding transactions
- Released amount
- Remaining balance
- Funding wallet addresses, shortened in public view

---

# 17. Suggested v1 Status Model

## 17.1 Escrow Status

Suggested statuses:

1. Initialized
2. Funded / Partially Funded
3. Active
4. Paused
5. Cancelled
6. Completed

## 17.2 Milestone Status

Suggested statuses:

1. Pending
2. In Progress
3. Ready for Review
4. Approved
5. Disputed
6. Released

---

# 18. Success Criteria

The v1 pilot is successful if CMinds can show communities that:

1. A community can create a funding request.
2. The request uses a predefined task menu.
3. Each selected task becomes a milestone.
4. The community can define fixed milestone amounts.
5. CMinds can review and approve milestones.
6. Funders can fund an initialized escrow using USDC.
7. The community can submit evidence.
8. A community leader can manually release approved milestone funds.
9. Public stakeholders can see the escrow’s progress.
10. The model is understandable enough to test with real communities.

---

# 19. 15-Day Delivery Focus

Because the reason for v1 is to show something to communities in approximately 15 days, delivery should prioritize:

1. Working end-to-end demo flow
2. Clear community-facing UX
3. Fixed task menu
4. Milestone creation
5. Funding page
6. Evidence links
7. CMinds approval
8. Per-milestone release
9. Public transparency page

Polish, automation, advanced reporting, and sophisticated permissioning should be deferred.

---

# 20. Recommended Demo Scenario

The recommended demo scenario should use a simple community coordination flow.

## Demo Project

**Community Coordination for Coastal Protection Initiative**

## Selected Tasks

| Code | Task                            | Example Amount |
| ---- | ------------------------------- | -------------- |
| ---  | ---                             | ---:           |
| G-01 | Hiring a campaign coordinator   | $500           |
| G-02 | Coordination team meeting       | $150           |
| C-01 | Community assembly or meeting   | $250           |
| G-04 | Progress report to the platform | $100           |

## Demo Flow

1. Community connects wallet.
2. Community creates escrow request.
3. Community selects tasks.
4. Community assigns fixed amounts.
5. Community initializes escrow.
6. Funder funds escrow with USDC.
7. Community submits evidence for G-02.
8. CMinds approves milestone.
9. Community leader signs release.
10. Transparency page updates.

---

# 21. Open Risks

## 21.1 Wallet Readiness

Communities may not yet be comfortable using wallets.

Mitigation:

- Use Freighter for demo.
- Provide guided onboarding.
- Defer wallet abstraction to later version.

## 21.2 Evidence Quality

Evidence may be inconsistent or incomplete.

Mitigation:

- Use fixed task menu with expected deliverables.
- Allow CMinds to dispute or request clarification off-platform.

## 21.3 Privacy

Public transparency may expose sensitive information.

Mitigation:

- Use shortened wallet addresses.
- Use links initially.
- Add privacy controls later.

## 21.4 Operational Subjectivity

Pause/cancel criteria may be subjective.

Mitigation:

- Treat pause/cancel as admin flow in v1.
- Let CMinds define criteria operationally.

## 21.5 Scope Creep

The agreement template contains broader wallet use, payment methods, electronic signature, non-compliance, confidentiality, and legal provisions that exceed v1 scope.

Mitigation:

- Focus v1 on escrow, task menu, evidence, approval, funding, and release.
- Defer legal contract automation, electronic signature, and wallet spending controls.

---

# 22. Out of Scope for v1 but Relevant Later

The Vital Oceans / CMinds template includes several items that may become future features:

1. Electronic agreement generation
2. Electronic signature
3. Wallet activation in the name of Community Implementer
4. Expense categories and spending thresholds
5. Quote approval for larger purchases
6. Receipt upload requirements
7. Automatic approval if no response within N days
8. Automatic return of unused funds
9. Confidentiality and ownership rules
10. Formal termination handling
11. Arbitration or mediation workflows
12. Multi-language contract generation

These should be treated as future roadmap items, not first pilot commitments.

---

# 23. Product Build Budget Boundary

The pilot build budget should cover:

- Product design
- UX flows
- Application development
- Trustless Work integration
- Demo preparation
- Iteration support
- Basic documentation

The pilot build budget does not include escrow capital.

Escrow funding is separate from the product/design/build work.

---

# 24. v1 Requirement Summary

The first version should deliver:

> A simple working role-based escrow pilot where communities create escrow requests from a fixed task menu, assign fixed milestone amounts, submit evidence links, CMinds reviews and approves/disputes milestones, funders can fund initialized escrows with USDC, and community leaders manually release funds per approved milestone, while funders and interested parties can track progress through a public transparency viewer.
