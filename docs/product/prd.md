# Know Your Package (KYP): product requirements for the MVP

- **Ticket:** KYP-9 (Epic KYP-7, Product Documentation)
- **Based on:** [the product idea](idea.md), which holds the product decisions **[D1]** to **[D8]**, the terms used here, the acceptance test and the assumptions up to A13.
- **Status:** proposal. The priorities and the detailed MVP boundary have not been confirmed. The assumptions are validated by the criteria of the human Product Owner **[D11]**, not tested. The scope is not closed until the points in [Before the scope is closed](#before-the-scope-is-closed) are settled.
- **Markers:** **[D…]** is a confirmed product decision (D1 to D8 in the [idea](idea.md#product-decisions), D9 onwards in [Product decisions](#product-decisions)) and **[A…]** an assumption, with its validation state in [Assumptions](#assumptions).

## Overview and main goal

KYP is a free tool, used inside Salesforce, that gives a visual and up-to-date picture of a partner's second-generation managed packages (2GP) **[D1] [D7]**. It only shows information **[D5]**. In the MVP that information is loaded by hand; keeping it in step with the partner's org is a later phase **[D12]**.

> **A Package Owner at an ISV partner can easily see, in one visual place inside Salesforce, the current state of their 2GP packages: which packages and versions exist, how they relate, and which customers run each version.**

Requirements refer to the parts of this goal as follows:

| Part | Meaning |
|---|---|
| G1 | Which packages and versions exist, in their current state |
| G2 | How they relate: version ancestry and package dependencies |
| G3 | Which customers run each version |
| G4 | Seen easily, in one visual place inside Salesforce **[D8]** |

## Problem statement

An ISV partner has no quick, overall and readable answer to **"what have we built, and who is running what?"**. No user research has been done on the [pain points](idea.md#problem-to-solve), which rest on the human Product Owner's validation **[D11]**: the information is scattered (P1, **[A1]**), hard to read (P2, **[A2]**) and organised by org instead of by customer (P3, **[A3]**).

[Package Visualizer](idea.md#existing-alternative-package-visualizer) already covers much of this. KYP is meant as a free alternative with a better user experience **[D1]**, which has not been tested **[A6]**.

## Target users

| User | Needs | Place in the MVP |
|---|---|---|
| Package Owner | To answer the [reference questions](idea.md#how-we-will-know-it-is-achieved) Q1 to Q4 quickly, to support decisions about versions, upgrades and support cases **[A2]** | Primary user **[D2]**. Requirements and design choices serve this user first |
| Product, release and support roles | Some of the same answers **[A2]** | May use KYP. Nothing is designed specifically for them |
| Developers and release engineers | Likely to get much of this information with technical tools they already use | Not the primary user **[D2]**. Nothing is designed specifically for them |

## Features and functional requirements

| Priority | Meaning |
|---|---|
| Must | In the MVP. Without it a reference question cannot be answered correctly, a confirmed decision is not met, customer information is exposed or a page that carries the answers is missing |
| Should | In the MVP. Requested for the product or makes the picture easier to read, but no reference question or confirmed decision depends on it |
| Could | Outside the MVP. Candidate for a later phase |
| Won't | Excluded from this phase by a confirmed decision |

**Supports** names the parts of the main goal (G) and the reference questions (Q) that a requirement serves. "Active customer" is defined in **[D3]** and counted as in **[A5]** and **[A16]**.

### F1: Overview of all packages

| ID | Requirement | Priority | MVP | Supports |
|---|---|---|---|---|
| FR-01 | The overview shows the number of the partner's 2GP managed packages and lists each one by name and namespace. Other package types are not counted. With no package, it shows 0 and says that there are none | Must | In | G1; Q1 |
| FR-02 | For each package, the overview shows the number and creation date of its latest promoted version and of its latest beta version, the latest being the most recently created of its kind **[A13]**. When a package has no version of one kind, the overview says so | Must | In | G1; Q1 |
| FR-03 | For each package, the overview shows a chart comparing by number of active customers its promoted versions and any other version with a current installation, with the number written for each version, and says how many beta versions are not shown. It also shows the package's total of distinct active customers, which can be lower than the sum of the versions. With no active customer, it says so | Must | In | G3, G4; Q2 |
| FR-04 | From the overview, the user can open any package, and any version shown on it | Must | In | G4 |

### F2: Package

| ID | Requirement | Priority | MVP | Supports |
|---|---|---|---|---|
| FR-05 | The package page shows the package's name, namespace, description and number of promoted and of beta versions | Must | In | G1 |
| FR-06 | The package page lists the package's versions, most recently created first, each with its number, whether it is promoted or beta, its creation date and its number of active customers. Each one opens its version page | Must | In | G1, G3, G4; Q2 |
| FR-07 | The package page also lists the customers that have the package installed in any org and, for each, whether it is active and which versions it runs in production and in sandbox orgs **[D9]** | Must | In | G3 |

### F3: Version

| ID | Requirement | Priority | MVP | Supports |
|---|---|---|---|---|
| FR-08 | KYP lists the versions of all packages, each with its package, number, whether it is promoted or beta and its creation date. The list can be narrowed to one package, and each version opens its page | Should | In | G1, G4 |
| FR-09 | The version page shows the package, the full version number, the version name, whether it is promoted or beta, the creation date, the branch and commit when there is one and the number of active customers | Must | In | G1, G3 |
| FR-10 | The version page shows the customers and orgs running the version as a single list **[D10]**, with one row for each org: customer, org name, org ID, org type, org status and whether the customer is active on this version. When no org runs the version, the page says so | Must | In | G3; Q3 |

### F4: Dependencies

| ID | Requirement | Priority | MVP | Supports |
|---|---|---|---|---|
| FR-11 | The version page shows a diagram of the version and the package versions it depends on, as declared for that version **[A19]**, each with package name and version number. When none is declared, it says that there are no dependencies | Must | In | G2, G4; Q4 |
| FR-12 | The package page shows the same diagram for the latest promoted version of the package, or for the latest beta version when none is promoted, and says which version it shows **[A18]** | Must | In | G2, G4 |
| FR-13 | A dependency on a package that is not one of the partner's own appears in the diagram, marked as external, with whatever identifies it. It is never left out | Must | In | G2; Q4 |

### F5: Version hierarchy

| ID | Requirement | Priority | MVP | Supports |
|---|---|---|---|---|
| FR-14 | For each package, KYP shows a tree linking every version to its immediate ancestor, with promoted and beta versions told apart. Every version without an ancestor is a root, and a package can have several | Must | In | G2, G4; Q4 |
| FR-15 | The version page names the immediate ancestor of the version, or says that it has none, and leads to the tree with that version highlighted | Must | In | G2, G4; Q4 |
| FR-16 | Each version in the tree opens its version page | Should | In | G4 |

### Rules that apply to every feature

| ID | Requirement | Priority | MVP | Supports |
|---|---|---|---|---|
| FR-17 | An org with no known customer **[A14]** is listed with its org details and "Customer unknown" as its customer. It is not added to any customer count and never left out. Wherever active customers per version are shown, the number of production orgs with an unknown customer on that version is shown too | Must | In | G3; Q2, Q3 |
| FR-18 | Only current installations are counted and listed | Must | In | G3; Q2, Q3 |
| FR-19 | Deleted packages and versions are left out of lists, counts, the tree and "latest". A deleted version that still has current installations stays on its package page and keeps its version page, marked as deleted in both **[A17]** | Must | In | G1, G3; Q1, Q2, Q3 |
| FR-20 | When information cannot be shown, for example for lack of permission or because a value is missing, KYP says what is not available. It does not present it as zero, as "none" or as an empty list | Must | In | G1, G2, G3; Q1 to Q4 |

### Requirements outside the MVP

| ID | Requirement | Priority | MVP | Reason |
|---|---|---|---|---|
| FR-21 | Start push upgrades from KYP | Won't | Out | **[D5]** |
| FR-22 | Manage licences, such as changing their status, seats or expiry | Won't | Out | **[D5]** |
| FR-23 | Show analytics about how customers use a package | Won't | Out | **[D5]** |
| FR-24 | Show first-generation, unlocked and unmanaged packages | Won't | Out | **[D5]** |
| FR-25 | Cover a Dev Hub and a LMA that are in different orgs | Could | Out | Matters once data is synchronised (FR-29) **[D4] [D12]** |
| FR-26 | Show, for one customer, all the packages and versions in its orgs | Could | Out | Not requested, and no reference question needs it |
| FR-27 | Show which packages depend on a given package | Could | Out | Q4 only asks what a version depends on |
| FR-28 | Search and filter by customer, org or version number | Could | Out | Not requested. To be reconsidered if NFR-01 fails without it |
| FR-29 | Synchronise KYP's data with the data in the partner's org or in any other required data source | Could | Out | **[D12]**: candidate for a next phase |

## Non-functional requirements

| ID | Requirement | Priority | MVP | Supports the goal because |
|---|---|---|---|---|
| NFR-01 | **Ease of use:** a user who meets the [test conditions](idea.md#how-we-will-know-it-is-achieved) answers each of Q1 to Q4 correctly in under 1 minute **[D6]** | Must | In | G4: it tests "easily" **[D8]** |
| NFR-02 | **Inside Salesforce:** all KYP information is seen inside Salesforce, with no other tool, application or additional sign-in **[D7]** | Must | In | G4 |
| NFR-03 | **Current:** each view shows information that matches the data held in KYP when it is opened **[D12]** | Must | In | G1 to G3: the goal is the current state |
| NFR-04 | **Complete:** counts, lists and diagrams include every item that applies. When KYP cannot include them all, it says so | Must | In | G1 to G3: a partial picture gives wrong answers |
| NFR-05 | **Response time:** each view shows its content within 10 seconds with the acceptance test data **[A21]** | Should | In | G4 |
| NFR-06 | **Readable:** every element of a chart or diagram is labelled with text, and promoted or beta, production or sandbox and deleted are not shown by colour alone | Should | In | G4 |
| NFR-07 | **View only:** KYP's features create, change and delete no package, version, customer or licence information, and start no operation in a subscriber org **[D5]**. Loading data by hand is not one of these features **[D12]** | Must | In | G1 to G3: seeing the state never changes it |
| NFR-08 | **Access:** only users to whom the partner grants access can see information in KYP | Must | In | G4: customer information can be offered inside Salesforce without being open to every user |
| NFR-09 | **Privacy:** customer, org and licence information is not sent outside the partner's Salesforce orgs **[A22]** | Must | In | G4: the picture stays inside Salesforce **[D7]** |

## MVP scope

### In scope

| Feature | Requirements | Reference questions |
|---|---|---|
| F1: Overview of all packages | FR-01 to FR-04 | Q1, Q2 |
| F2: Package | FR-05 to FR-07 | Q2 |
| F3: Version | FR-08 to FR-10 | Q3 |
| F4: Dependencies | FR-11 to FR-13 | Q4 |
| F5: Version hierarchy | FR-14 to FR-16 | Q4 |
| All features | FR-17 to FR-20, NFR-01 to NFR-09 | Q1 to Q4 |

The scope is sized for at most 5 user stories (KYP-10): one per feature, with the rules that apply to every feature and the non-functional requirements as acceptance criteria of those stories. If the scope has to shrink, the Should requirements are the first candidates to move out, by changing this document.

### Out of scope

- FR-21 to FR-29.
- Filling KYP's data other than by hand, including any synchronisation with the partner's org or other data sources **[D12]**.
- Any product feature that this document does not list as inside the MVP.
- User stories (KYP-10), UX design, architecture, technical design, data model (including where the information comes from), API specification and technology stack, which are defined elsewhere.

### Constraints

- KYP is free **[D1]**.
- It is used inside Salesforce **[D7]**. Which org it runs in and how a partner installs it are open.
- Its data is loaded by hand, to check that KYP works as expected. The data model holds everything the requirements show **[D12]**.
- It describes one org, the partner's Dev Hub, with the License Management App in that same org **[D4]**. This matters once data is synchronised (FR-29).
- It only shows information about 2GP managed packages **[D5]**.

### Before the scope is closed

1. Check in the data model design that it holds everything the requirements show **[D12]**.
2. Check that the acceptance test data can be loaded by hand **[A12]**.

## Success metrics

The only success measure is the one in **[D6]**: the user answers 4 of the 4 reference questions correctly, each in under 1 minute. The questions, test conditions and test data are defined in the [idea](idea.md#how-we-will-know-it-is-achieved). The test data is loaded by hand, and a correct answer matches the data held in KYP at the time of the test **[D12]**, read as in **[A5]**, **[A13]**, **[A14]**, **[A16]** and **[A17]**.

| Question | Requirements that answer it |
|---|---|
| Q1: number of packages, latest promoted and latest beta version of each | FR-01, FR-02 |
| Q2: active customers on each version of a package | FR-03, FR-06 |
| Q3: customers and orgs running a version | FR-10 |
| Q4: ancestor and dependencies of a version | FR-11, FR-14, FR-15 |

The acceptance test data does not exercise FR-13 or FR-17 to FR-20. Their acceptance criteria belong to the user stories (KYP-10) and need their own test cases.

## Product decisions

Decisions taken after the [idea](idea.md#product-decisions). The trade-offs and the reasons for rejecting alternatives are the assistant's assessment.

### D9: The package page lists its versions and its customers

- **Decision:** the package page shows both the list of the package's versions and the list of its customers (FR-06, FR-07).
- **Trade-offs:** the customer list is now a Must, so it is no longer a candidate to move out if the scope has to shrink.
- **Rejected:** keeping the customer list as a Should: it could be dropped from the MVP.

### D10: One list of customers and orgs on the version page

- **Decision:** the version page shows the customers and orgs running the version as a single list (FR-10).
- **Trade-offs:** a customer with several orgs appears on several rows, so the number of rows is not the number of customers. The number of active customers is shown separately (FR-09).
- **Rejected:** listing each customer with its orgs under it: it is not a single list.

### D11: The human Product Owner validates the assumptions

- **Decision:** the assumptions are validated by the criteria of the human Product Owner, Jesús Manuel Cantero.
- **Trade-offs:** requirements can build on them without waiting for research or tests. An assumption may still prove wrong, so the checks in [Before the scope is closed](#before-the-scope-is-closed) remain.
- **Rejected:** leaving them open until they are researched or tested: the product definition would stay unconfirmed.

### D12: The MVP uses data loaded by hand

- **Decision:** the data model of the app holds all the information the requirements need. How that data is filled is not part of the MVP, which uses data loaded by hand. Synchronising it with the partner's org or any other data source is out of scope and a candidate for a next phase (FR-29).
- **Why:** a data model with everything required mitigates the data risks of the MVP, and data loaded by hand is enough to check that the app works as expected.
- **Trade-offs:** KYP shows only what has been loaded, so it is as current and complete as that data. The MVP does not show that the information can be obtained from a partner's org, and a partner could only use it with real data by entering it by hand. For the MVP, "correct" in **[D6]** means matching the loaded data, and **[D4]** matters once data is synchronised.
- **Rejected:** synchronising data in the MVP.

## Assumptions

All the assumptions below were validated on 2026-11-28 by the criteria of the human Product Owner, **Jesús Manuel Cantero** **[D11]**. This is their judgement, not user research or a test: the notes say what has still not been checked.

### From the product idea

The full wording is in the [idea](idea.md#assumptions-not-yet-validated).

| ID | Subject | Requirements that rely on it | State after this document | Note |
|---|---|---|---|---|
| A1 | Getting the overall picture today means combining several sources and tools by hand | Product as a whole | Validated by the criteria of the human Product Owner | No user research done |
| A2 | The Package Owner and other roles need these answers and find the current outputs hard to read | Product as a whole | Validated by the criteria of the human Product Owner | No user research done |
| A3 | Partners reason about customers more than about orgs | Product as a whole | Validated by the criteria of the human Product Owner | No user research done |
| A4 | Orgs can be linked to customers | FR-03, FR-06, FR-07, FR-09, FR-10, FR-17 | Validated by the criteria of the human Product Owner | Some orgs may have no known customer **[A14]**. To check in a real org before data sync |
| A5 | How active customers are counted on each version | FR-03, FR-06, FR-07, FR-09, FR-10 | Validated by the criteria of the human Product Owner | |
| A6 | A simpler, summary-first, customer-based view gives a better user experience than Package Visualizer | Product as a whole | Validated by the criteria of the human Product Owner | Package Visualizer has not been tried |
| A8 | Answering these questions today takes noticeably longer than the target | Product as a whole | Validated by the criteria of the human Product Owner | Not timed |
| A10 | The information can be obtained inside Salesforce | FR-29 | Validated by the criteria of the human Product Owner | Not needed for the MVP **[D12]**. To check before data sync |
| A12 | The acceptance test data can be set up | NFR-01 | Validated by the criteria of the human Product Owner | To be loaded by hand **[D12]** |
| A13 | "Latest" means most recently created | FR-02, FR-12 | Validated by the criteria of the human Product Owner | A patch of an older version created after a newer one counts as the latest |

### Added by this document

| ID | Assumption | Used by | State after this document | Note |
|---|---|---|---|---|
| A14 | The customer of an org, for a package, is the company that the partner has linked to the licence of that org for that package. Without that link, the customer is unknown | FR-03, FR-06, FR-07, FR-09, FR-10, FR-17 | Validated by the criteria of the human Product Owner | Not chosen: the company name given at installation. The share of linked orgs is to be checked before data sync |
| A16 | Every production org with a current installation counts, whatever its org status or licence status. The partner's own production orgs also count if they are linked to a customer | FR-03, FR-06, FR-07, FR-09, FR-10 | Validated by the criteria of the human Product Owner | Not chosen: leaving out inactive, trial, demo or internal orgs |
| A17 | Deleted packages and versions are treated as in FR-19 | FR-19 | Validated by the criteria of the human Product Owner | |
| A18 | One version's dependencies, as chosen in FR-12, are a useful dependency view for a package | FR-12 | Validated by the criteria of the human Product Owner | Not chosen: combining all versions, or letting the user choose |
| A19 | The dependencies declared for a version answer "which packages does it depend on". KYP does not work out further indirect dependencies | FR-11, FR-12, FR-13 | Validated by the criteria of the human Product Owner | Not tried with a version that has indirect dependencies |
| A21 | 10 seconds per view is an acceptable response time | NFR-05 | Validated by the criteria of the human Product Owner | Not measured. The data volumes to support are not defined |
| A22 | Partners require their customer, org and licence information to stay in their Salesforce orgs | NFR-09 | Validated by the criteria of the human Product Owner | No user research done |
| A23 | The Package Owner has, or can be given, access to the information that KYP shows | All | Validated by the criteria of the human Product Owner | Which access is needed is to be checked before data sync |

## Dependencies and risks

### Dependencies

| ID | Dependency |
|---|---|
| DEP-01 | The data model of the app holds all the information the requirements show **[D12]** |
| DEP-02 | The data for testing the MVP is loaded by hand **[D12] [A12]** |
| DEP-03 | The user has access to the information in KYP (NFR-08) |
| DEP-04 | The user stories (KYP-10) and any technical definition build on this document |

### Risks

| ID | Risk | Effect | Response |
|---|---|---|---|
| R-01 | Some information the requirements show is not available **[A10]** | The MVP cannot show it, or questions are answered wrongly | Mitigated in the MVP: the data model holds all of it and data is loaded by hand **[D12]**. To check again before data sync |
| R-02 | Many orgs are not linked to a customer **[A14]** | Customer counts are low and many orgs show as unknown | Does not depend on the partner's org in the MVP **[D12]**. FR-17 keeps such orgs visible. Measure the share before data sync |
| R-03 | Partners have many subscriber orgs | Slow or incomplete views | In the MVP only the loaded data counts **[D12]** (NFR-04, NFR-05). Settle the data volumes before data sync **[A21]** |
| R-04 | The test needs two production orgs of one customer, which may be hard to obtain **[A12]** | The success measure cannot be run | Mitigated: the test data is loaded by hand, so no real orgs are needed **[D12]** |
| R-05 | KYP is not noticeably easier than Package Visualizer **[A6]** | Partners have no reason to use it | Try Package Visualizer against Q1 to Q4 and compare |
| R-06 | Five features, two of them diagrams, are too much for a small MVP **[D5]** | The MVP is not finished | Move Should requirements out first |
| R-07 | Without data sync, the information has to be kept up to date by hand **[D12]** | The MVP shows that the app works, not that partners get a current picture with little effort | Accepted for the MVP. Data sync is a candidate for a next phase (FR-29) |
