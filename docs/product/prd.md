# Know Your Package (KYP): product requirements for the MVP

- **Ticket:** KYP-9 (Epic KYP-7, Product Documentation)
- **Based on:** [the product idea](idea.md), which holds the product decisions **[D1]** to **[D8]**, the terms used here, the acceptance test and the assumptions up to A13.
- **Status:** proposal. The priorities, the detailed MVP boundary and the assumptions have not been confirmed. The scope is not closed until the points in [Before the scope is closed](#before-the-scope-is-closed) are settled.
- **Markers:** **[D…]** is a confirmed product decision ([idea](idea.md#product-decisions)), **[A…]** an assumption that has not been validated ([Assumptions](#assumptions)) and **[S…]** a source about Salesforce (S1 to S9 in the [idea](idea.md#sources), S10 onwards in [Sources](#sources)).

## Overview and main goal

KYP is a free tool, used inside Salesforce, that gives a visual and up-to-date picture of a partner's second-generation managed packages (2GP) **[D1] [D7]**. It only shows information **[D5]**.

> **A Package Owner at an ISV partner can easily see, in one visual place inside Salesforce, the current state of their 2GP packages: which packages and versions exist, how they relate, and which customers run each version.**

Requirements refer to the parts of this goal as follows:

| Part | Meaning |
|---|---|
| G1 | Which packages and versions exist, in their current state |
| G2 | How they relate: version ancestry and package dependencies |
| G3 | Which customers run each version |
| G4 | Seen easily, in one visual place inside Salesforce **[D8]** |

## Problem statement

An ISV partner has no quick, overall and readable answer to **"what have we built, and who is running what?"**. The [pain points](idea.md#problem-to-solve) are hypotheses, as no user research has been done: the information is scattered (P1, **[A1]**), hard to read (P2, **[A2]**) and recorded per org instead of per customer (P3, **[A3]**).

[Package Visualizer](idea.md#existing-alternative-package-visualizer) already covers much of this. KYP is meant as a free alternative with a better user experience **[D1]**, which is not validated **[A6]**.

## Target users

| User | Needs | Place in the MVP |
|---|---|---|
| Package Owner | To answer the [reference questions](idea.md#how-we-will-know-it-is-achieved) Q1 to Q4 quickly, to support decisions about versions, upgrades and support cases **[A2]** | Primary user **[D2]**. Requirements and design choices serve this user first |
| Product, release and support roles | Some of the same answers **[A2]** | May use KYP. Nothing is designed specifically for them |
| Developers and release engineers | Likely to get much of this information from the command line | Not the primary user **[D2]**. Nothing is designed specifically for them |

## Salesforce 2GP package information

This is the information KYP must provide and where Salesforce records it. Sources are documentation and the code of Salesforce's packaging library. **Nothing has been tried in a real org**, and that all of it can be obtained from within Salesforce is not verified **[A10]**.

| ID | Information | Where Salesforce records it | How well it is verified | Used by |
|---|---|---|---|---|
| I-01 | Package: name, namespace, description and type (managed or unlocked) | `Package2` **[S1] [S13] [S14]** | Pages fetched (S13, S14) | FR-01, FR-05 |
| I-02 | Version: package, number (major, minor, patch, build), name, branch and creation date | `Package2Version` **[S2] [S10]** | Page fetched (S10) | FR-02, FR-06, FR-08, FR-09 |
| I-03 | Whether a version is promoted or beta | `Package2Version`, released flag **[S10]** | Page fetched | FR-02, FR-06, FR-09, FR-14 |
| I-04 | Whether a package or version is deleted | Deprecated flag on `Package2` and `Package2Version` **[S10] [S11] [S13]** | Pages fetched for versions. For packages, only that the flag exists **[A17]** | FR-19 |
| I-05 | Immediate ancestor of a version | `Package2Version`, ancestor field **[S2] [S15]** | Page fetched (S15) | FR-14, FR-15 |
| I-06 | Package versions that a version depends on | `SubscriberPackageVersion`, dependencies field **[S16]** | Page fetched | FR-11, FR-12, FR-13 |
| I-07 | Orgs with a package installed: org name, org ID, org type (production or sandbox), org status (Active, Demo, Free, Inactive or Trial) and installed version | `PackageSubscriber`, queried in the Dev Hub **[S5] [S17] [S18]** | Search result summaries only | FR-03, FR-06, FR-07, FR-09, FR-10, FR-17 |
| I-08 | Whether an installation is current | Installed status on `PackageSubscriber`, where `i` means installed **[S17]**. LMA licence records have an Uninstalled status **[S19]** | Search result summaries only. The other installed status values are unknown **[A15]** | FR-18 |
| I-09 | Customer of an org | LMA licence record: subscriber org ID, and the account of a converted lead **[S19]** | Search result summary only **[A14]** | FR-03, FR-06, FR-07, FR-09, FR-10, FR-17 |

What these records imply for the requirements:

- **Customers are not automatic.** Installing a package creates a lead and a licence record in the LMA **[S6]**. The licence's account field refers to the account of a converted lead **[S19]**, so we infer that an org may have no customer until the partner converts the lead or links an account **[A14]**. Installations made before the LMA was set up may need to be synchronised **[S6]**.
- **Beta versions have no active customers.** They cannot be installed in a production org **[S20]**. They are also not visible in the LMA **[S21]**, so we infer that the customer of an org running a beta version may be unknown.
- **Ancestors are promoted versions.** Only a promoted version can be an ancestor **[S22]**, and only beta versions can be deleted **[S12]**. We infer that an ancestor is never a deleted version.
- **Dependencies can leave the Dev Hub.** A version can depend on a package that is not in the partner's Dev Hub **[S23]**.
- **Installation keys may hide dependencies.** The command that shows dependencies accepts the installation key of a key-protected version **[S4]**, and the packaging library uses it when it reads those dependencies **[S16]**. We infer that the key may be needed **[A20]**.

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
| FR-03 | For each package, the overview shows a chart comparing its versions by number of active customers, with the number written for each version, and the package's total of distinct active customers, which can be lower than the sum of the versions. With no active customer, it says so | Must | In | G3, G4; Q2 |
| FR-04 | From the overview, the user can open any package, and any version shown on it | Must | In | G4 |

### F2: Package

| ID | Requirement | Priority | MVP | Supports |
|---|---|---|---|---|
| FR-05 | The package page shows the package's name, namespace, description and number of promoted and of beta versions | Must | In | G1 |
| FR-06 | The package page lists the package's versions, most recently created first, each with its number, whether it is promoted or beta, its creation date and its number of active customers. Each one opens its version page | Must | In | G1, G3, G4; Q2 |
| FR-07 | The package page lists the customers that have the package installed in any org and, for each, whether it is active and which versions it runs in production and in sandbox orgs | Should | In | G3 |

### F3: Version

| ID | Requirement | Priority | MVP | Supports |
|---|---|---|---|---|
| FR-08 | KYP lists the versions of all packages, each with its package, number, whether it is promoted or beta and its creation date. The list can be narrowed to one package, and each version opens its page | Should | In | G1, G4 |
| FR-09 | The version page shows the package, the full version number, the version name, whether it is promoted or beta, the creation date, the branch when there is one and the number of active customers | Must | In | G1, G3 |
| FR-10 | The version page lists the customers running the version and, under each one, its orgs running it, with org name, org ID, org type and org status. Each customer is marked as active on this version or not. When no org runs the version, the page says so | Must | In | G3; Q3 |

### F4: Dependencies

| ID | Requirement | Priority | MVP | Supports |
|---|---|---|---|---|
| FR-11 | The version page shows a diagram of the version and the package versions it depends on, as recorded for that version **[A19]**, each with package name and version number. When none is recorded, it says that there are no dependencies | Must | In | G2, G4; Q4 |
| FR-12 | The package page shows the same diagram for the latest promoted version of the package, or for the latest beta version when none is promoted, and says which version it shows **[A18]** | Must | In | G2, G4 |
| FR-13 | A dependency on a package that is not in the partner's Dev Hub appears in the diagram, marked as external, with whatever identifies it. It is never left out | Must | In | G2; Q4 |

### F5: Version hierarchy

| ID | Requirement | Priority | MVP | Supports |
|---|---|---|---|---|
| FR-14 | For each package, KYP shows a tree linking every version to its immediate ancestor, with promoted and beta versions told apart. Every version without an ancestor is a root, and a package can have several | Must | In | G2, G4; Q4 |
| FR-15 | The version page names the immediate ancestor of the version, or says that it has none, and leads to the tree with that version highlighted | Must | In | G2, G4; Q4 |
| FR-16 | Each version in the tree opens its version page | Should | In | G4 |

### Rules that apply to every feature

| ID | Requirement | Priority | MVP | Supports |
|---|---|---|---|---|
| FR-17 | An org with no known customer **[A14]** is listed under "Customer unknown" with its org details. It is not added to any customer count and never left out. Wherever active customers per version are shown, the number of production orgs with an unknown customer on that version is shown too | Must | In | G3; Q2, Q3 |
| FR-18 | Only current installations are counted and listed **[A15]** | Must | In | G3; Q2, Q3 |
| FR-19 | Deleted packages and versions are left out of lists, counts, the tree and "latest". A deleted version that still has current installations stays on its package page and keeps its version page, marked as deleted in both **[A17]** | Must | In | G1, G3; Q1, Q2, Q3 |
| FR-20 | When information cannot be obtained, for example for lack of permission, of LMA data or of access to a dependency, KYP says what is not available. It does not present it as zero, as "none" or as an empty list | Must | In | G1, G2, G3; Q1 to Q4 |

### Requirements outside the MVP

| ID | Requirement | Priority | MVP | Reason |
|---|---|---|---|---|
| FR-21 | Start push upgrades from KYP | Won't | Out | **[D5]** |
| FR-22 | Manage licences, such as changing their status, seats or expiry | Won't | Out | **[D5]** |
| FR-23 | Show analytics about how customers use a package | Won't | Out | **[D5]** |
| FR-24 | Show first-generation, unlocked and unmanaged packages | Won't | Out | **[D5]** |
| FR-25 | Cover a Dev Hub and a LMA that are in different orgs | Could | Out | **[D4]** leaves it to a later technical definition |
| FR-26 | Show, for one customer, all the packages and versions in its orgs | Could | Out | Not requested, and no reference question needs it |
| FR-27 | Show which packages depend on a given package | Could | Out | Q4 only asks what a version depends on |
| FR-28 | Search and filter by customer, org or version number | Could | Out | Not requested. To be reconsidered if NFR-01 fails without it |

## Non-functional requirements

| ID | Requirement | Priority | MVP | Supports the goal because |
|---|---|---|---|---|
| NFR-01 | **Ease of use:** a user who meets the [test conditions](idea.md#how-we-will-know-it-is-achieved) answers each of Q1 to Q4 correctly in under 1 minute **[D6]** | Must | In | G4: it tests "easily" **[D8]** |
| NFR-02 | **Inside Salesforce:** all KYP information is seen inside Salesforce, with no command line, hand-written query, other application or additional sign-in **[D7]** | Must | In | G4 |
| NFR-03 | **Current:** each view shows information that matches the source records when it is opened, or shows when the information was obtained and lets the user refresh it. After a refresh it matches the source records | Must | In | G1 to G3: the goal is the current state |
| NFR-04 | **Complete:** counts, lists and diagrams include every record that applies. When KYP cannot include them all, it says so | Must | In | G1 to G3: a partial picture gives wrong answers |
| NFR-05 | **Response time:** each view shows its content within 10 seconds with the acceptance test data **[A21]** | Should | In | G4 |
| NFR-06 | **Readable:** every element of a chart or diagram is labelled with text, and promoted or beta, production or sandbox and deleted are not shown by colour alone | Should | In | G4 |
| NFR-07 | **View only:** KYP creates, changes and deletes no package, version, subscriber or licence record, and starts no operation in a subscriber org **[D5]** | Must | In | G1 to G3: seeing the state never changes it |
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

- FR-21 to FR-28.
- Any product feature that this document does not list as inside the MVP.
- User stories (KYP-10), architecture, data model, API specification, UX design and technology stack, which are defined elsewhere.

### Constraints

- KYP is free **[D1]**.
- It is used inside Salesforce **[D7]**. Which org it runs in and how a partner installs it are open.
- It describes one org, the partner's Dev Hub, with the License Management App in that same org **[D4]**.
- It only shows information about 2GP managed packages **[D5]**.

### Before the scope is closed

1. Check that the information in I-01 to I-09 can be obtained from within Salesforce **[A10] [A15] [A20] [A23]**.
2. Check in a real org how many subscriber orgs can be linked to a customer **[A4] [A14]**.
3. Check that the acceptance test data can be set up **[A12]**.
4. Confirm the product choices in **[A5] [A13] [A14] [A16] [A17] [A18] [A19] [A21] [A22]**.

## Success metrics

The only success measure is the one in **[D6]**: the user answers 4 of the 4 reference questions correctly, each in under 1 minute. The questions, test conditions and test data are defined in the [idea](idea.md#how-we-will-know-it-is-achieved). A correct answer matches the Salesforce source records, read as in **[A5]**, **[A13]** and **[A14]** to **[A17]**.

| Question | Requirements that answer it |
|---|---|
| Q1: number of packages, latest promoted and latest beta version of each | FR-01, FR-02 |
| Q2: active customers on each version of a package | FR-03, FR-06 |
| Q3: customers and orgs running a version | FR-10 |
| Q4: ancestor and dependencies of a version | FR-11, FR-14, FR-15 |

The acceptance test data does not exercise FR-13 or FR-17 to FR-20. Their acceptance criteria belong to the user stories (KYP-10) and need their own test cases.

## Assumptions

### From the product idea

The full wording is in the [idea](idea.md#assumptions-not-yet-validated). A1, A2, A3, A6 and A8 concern the problem and the value, and underlie the product as a whole.

| ID | Subject | Requirements that rely on it | State after this document |
|---|---|---|---|
| A4 | Orgs can be linked to customers | FR-03, FR-06, FR-07, FR-09, FR-10, FR-17 | Checked in documentation only: a link exists, but we infer that it is not there for every org **[A14]** |
| A5 | How active customers are counted on each version | FR-03, FR-06, FR-07, FR-09, FR-10 | Not confirmed |
| A10 | The information can be obtained inside Salesforce | All | Not checked |
| A12 | The acceptance test data can be set up | NFR-01 | Not checked |
| A13 | "Latest" means most recently created | FR-02, FR-12 | Not confirmed. A patch of an older version created after a newer one would count as the latest |

### Added by this document

| ID | Assumption | Used by | How to validate it |
|---|---|---|---|
| A14 | The customer of an org, for a package, is the account linked to the LMA licence record of that org and package. Without one, the customer is unknown. Licence records can be matched with installations by org ID | FR-03, FR-06, FR-07, FR-09, FR-10, FR-17 | Product choice to confirm (an alternative is to use the company name of the lead). Check the matching and the share of linked orgs in a real org |
| A15 | `PackageSubscriber` records say what is installed where, include beta versions and sandbox orgs, and tell current installations from removed ones | FR-03, FR-06, FR-07, FR-10, FR-18 | Check in a real org with beta, sandbox and uninstalled cases |
| A16 | Every production org with a current installation counts, whatever its org status or licence status. The partner's own production orgs also count if they are linked to a customer | FR-03, FR-06, FR-07, FR-09, FR-10 | Product choice to confirm (an alternative is to leave out inactive, trial, demo or internal orgs) |
| A17 | The deprecated flag means deleted, for packages as for versions, and deleted items are treated as in FR-19 | FR-19 | Check the flag on packages. Confirm the treatment as a product choice |
| A18 | One version's dependencies, as chosen in FR-12, are a useful dependency view for a package | FR-12 | Product choice to confirm (alternatives are to combine all versions or to let the user choose) |
| A19 | The dependencies recorded for a version answer "which packages does it depend on". KYP does not work out further indirect dependencies | FR-11, FR-12, FR-13 | Compare the recorded dependencies with the Salesforce CLI result for a version with indirect dependencies. Confirm as a product choice |
| A20 | Dependencies can be obtained without asking the user for installation keys | FR-11, FR-12 | Try it with a key-protected version |
| A21 | 10 seconds per view is an acceptable response time. There is no measurement behind this figure, and no expected data volume | NFR-05 | Confirm the target and the data volumes to support |
| A22 | Partners require their customer, org and licence information to stay in their Salesforce orgs | NFR-09 | Product choice to confirm |
| A23 | The Package Owner has, or can be given, the permissions needed to see package, version, subscriber and licence records | All | Check which permissions are needed. Working with 2GP packages in a Dev Hub calls for a permission set that includes the permission to create and update those packages **[S24]** |

## Dependencies and risks

### Dependencies

| ID | Dependency |
|---|---|
| DEP-01 | The partner has a Dev Hub with 2GP managed packages. A search summary says Salesforce recommends using the Partner Business Org for it **[S25]** |
| DEP-02 | The License Management App is in that same org **[D4]**. It comes installed in a Partner Business Org obtained through the standard partner signup **[S6]** |
| DEP-03 | The packages are registered with the License Management App, which then records their installations **[S21]** |
| DEP-04 | The partner links its licence records to accounts **[A14]** |
| DEP-05 | The user has the permissions needed to see the information **[A23]** |
| DEP-06 | Package and version records, exposed through the Tooling API **[S1] [S2]**, and the other records can be obtained from within Salesforce **[A10]** |
| DEP-07 | The user stories (KYP-10) and any technical definition build on this document |

### Risks

| ID | Risk | Effect | Response |
|---|---|---|---|
| R-01 | Some information cannot be obtained from within Salesforce **[A10]** | The MVP cannot be built as described | Check feasibility before the scope is closed |
| R-02 | Many orgs are not linked to a customer **[A14]** | Customer counts are low and many orgs show as unknown | FR-17 keeps them visible. Measure the share in a real org and review the customer definition |
| R-03 | Installation records miss beta or sandbox orgs, or keep removed installations **[A15]** | Q2 and Q3 are answered wrongly | Check before the scope is closed |
| R-04 | Dependencies of key-protected versions cannot be read **[A20]** | Part of Q4 cannot be answered | FR-20 states what is missing. Review whether the MVP must accept keys |
| R-05 | Partners have many subscriber orgs. A search summary of the object reference warns that querying them can take a while **[S17]** | Slow or incomplete views | NFR-04 and NFR-05. Settle the data volumes **[A21]** |
| R-06 | The test needs two production orgs of one customer, which may be hard to obtain **[A12]** | The success measure cannot be run | Try the setup early |
| R-07 | KYP is not noticeably easier than Package Visualizer **[A6]** | Partners have no reason to use it | Try Package Visualizer against Q1 to Q4 and compare |
| R-08 | Five features, two of them diagrams, are too much for a small MVP **[D5]** | The MVP is not finished | Move Should requirements out first |

## Sources

S10 onwards were checked on 2026-11-27. S1 to S9 are listed in the [idea](idea.md#sources).

| ID | Source | How it was checked |
|---|---|---|
| S10 | [Salesforce packaging library: package version list](https://raw.githubusercontent.com/forcedotcom/packaging/main/src/package/packageVersionList.ts) | Page fetched |
| S11 | [Salesforce packaging library: package version](https://raw.githubusercontent.com/forcedotcom/packaging/main/src/package/packageVersion.ts) | Page fetched |
| S12 | [Salesforce CLI: help text of the version delete command](https://raw.githubusercontent.com/salesforcecli/plugin-packaging/main/messages/package_version_delete.md) | Page fetched |
| S13 | [Salesforce packaging library: package](https://raw.githubusercontent.com/forcedotcom/packaging/main/src/package/package.ts) | Page fetched |
| S14 | [Salesforce CLI: help text of the package create command](https://raw.githubusercontent.com/salesforcecli/plugin-packaging/main/messages/package_create.md) | Page fetched |
| S15 | [Salesforce packaging library: package ancestry](https://raw.githubusercontent.com/forcedotcom/packaging/main/src/package/packageAncestry.ts) | Page fetched |
| S16 | [Salesforce packaging library: version dependencies](https://raw.githubusercontent.com/forcedotcom/packaging/main/src/package/packageVersionDependency.ts) | Page fetched |
| S17 | [Object reference: PackageSubscriber, current address](https://developer.salesforce.com/docs/platform/object-reference/references/standard-objects/object-packagesubscriber.html) | Search result summary only (the site refused direct reading) |
| S18 | [Schedule a push upgrade using the CLI](https://developer.salesforce.com/docs/platform/pkg2-dev/guide/push-upgrade-cli.html) | Search result summary only |
| S19 | [License object fields](https://developer.salesforce.com/docs/platform/pkg2-dev/guide/lma-license-details.html) | Search result summary only (the site refused direct reading) |
| S20 | [Trailhead: managed 2GP package development workflow](https://trailhead.salesforce.com/content/learn/modules/second-generation-managed-packages/discover-the-2gp-package-development-workflow) | Page fetched |
| S21 | [Associate a package with the License Management App](https://developer.salesforce.com/docs/platform/pkg2-dev/guide/lma-associate-package.html) | Search result summary only |
| S22 | [Package ancestors for 2GP managed packages](https://developer.salesforce.com/docs/platform/pkg2-dev/guide/sfdx-dev-dev2gp-package-ancestor-intro.html) | Search result summary only |
| S23 | [Advanced project configuration parameters for 2GP managed packages](https://developer.salesforce.com/docs/platform/pkg2-dev/guide/sfdx-dev2gp-adv-config-file.html) | Search result summary only |
| S24 | [Assign 2GP managed packaging user permissions](https://developer.salesforce.com/docs/platform/pkg2-dev/guide/sfdx-pkg-user-permission.html) | Search result summary only |
| S25 | [Enable Dev Hub and 2GP managed packaging](https://developer.salesforce.com/docs/platform/pkg2-dev/guide/sfdx-pkg-enable-devhub.html) | Search result summary only |
