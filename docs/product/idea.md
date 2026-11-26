# Know Your Package (KYP): product idea and main goal

- **Ticket:** KYP-8 (Epic KYP-7, Product Documentation)
- **Assumptions:** statements marked **[A1]** to **[A12]** have not been validated. They are listed in [Assumptions](#assumptions-not-yet-validated).
- **Sources:** facts about Salesforce are marked **[S1]** to **[S8]** and listed in [Sources](#sources). They were checked on 2026-11-26.

## In short

- **What it is:** a tool, used inside Salesforce, that gives a visual and up-to-date picture of a partner's second-generation managed packages (2GP).
- **Who it is for:** Salesforce ISV partners that build and distribute 2GP managed packages.
- **Why it is needed:** a partner needs to know which package versions exist and who is running them. We believe that getting this overall picture today means combining several sources and tools by hand **[A1]**.

## Terms

| Term | Meaning in this document |
|---|---|
| ISV partner | An independent software vendor: a company that builds apps on Salesforce and distributes them to customers as packages |
| 2GP | Second-generation managed package, which is released in successive versions |
| Dev Hub | The Salesforce org where the partner's 2GP packages and versions are registered |
| Subscriber org | A Salesforce org, production or sandbox, where one of the partner's packages is installed |
| Customer | A company that uses a package. It may have several subscriber orgs **[A4]** |
| Version hierarchy (ancestry) | The tree that links each version to the earlier version it descends from |
| Dependency | A package that another package version needs in order to be installed |

## Current situation

Salesforce already holds the information, in different places:

| What the partner wants to know | Where it is available today |
|---|---|
| Which packages and versions exist | Dev Hub records, `Package2` and `Package2Version` **[S1] [S2]** |
| How versions descend from one another | A Salesforce CLI command that prints a tree or graph code **[S3]** |
| What a version depends on | A Salesforce CLI command that returns graph code **[S4]** |
| Which orgs have a package installed | `PackageSubscriber` records, one per installation, with the org name, org type (production or sandbox) and installation status **[S5]** |
| Which customers use which versions, and their licences | The License Management App (LMA) **[S6]** |
| Several of the above in one app | Package Visualizer, a free Salesforce Labs app **[S7] [S8]** (see [Existing alternative](#existing-alternative-package-visualizer)) |

## Problem to solve

An ISV partner has no quick, overall and readable answer to the question **"what have we built, and who is running what?"**.

No user research has been done, so the pain points are hypotheses:

| ID | Pain point |
|---|---|
| P1 | **Scattered information.** Answering means moving between the Dev Hub, the command line, queries and the LMA **[A1]** |
| P2 | **Hard to read.** Command output, graph code and record lists take effort to interpret, above all for people who do not work with the command line, such as product, release or support roles **[A2]** |
| P3 | **Orgs instead of customers.** Installations are recorded per org **[S5]**, while the partner reasons about customers **[A3]** |

We expect these to slow down decisions such as which versions to keep supporting, which customers should upgrade and how to handle a support case **[A2]**.

## Existing alternative: Package Visualizer

Package Visualizer already covers much of this idea, so it must be taken into account before building anything.

- Its AppExchange listing presents it as a free Salesforce Labs app to view and manage the 2GP and unlocked packages linked to a Dev Hub. It includes version ancestry, push upgrades, App Analytics log files and License Management App compatibility **[S7]**.
- The README of its repository, held in a personal GitHub account that we have not confirmed as official, also describes subscriber lists filtered by version, charts of how subscribers are spread across versions, a tree of version ancestry and dependencies, and licences with their associated account **[S8]**.

Neither source mentions a summary with the latest version of each package, or counting customers (not orgs) per version. Not being mentioned does not prove that it is missing, and the app has not been tried.

KYP's intended difference is a simpler, summary-first view expressed in terms of customers. That this difference is real and worth building is **not validated** **[A6]**.

## Proposed solution

Know Your Package is a tool used **inside Salesforce** (see [ADR 0007](../adr/0007-tool-inside-salesforce.md)) that presents the information about the partner's own packages, those registered in its Dev Hub **[A11]**, visually. It depends on that information being obtainable from within Salesforce **[A10]**. It works at three levels:

1. **Overview:** all the partner's packages at a glance.
2. **Package:** one package, with its versions, dependencies and customers.
3. **Version:** one version, with its place in the version hierarchy and the customers and orgs running it.

The features of each level, their priority and the MVP boundary belong to the PRD (KYP-9). The feature list received as input for this task is recorded word for word in [the session prompt log](../../prompts/2026-11-26-product-idea.md) (Prompt 3), as input for that task.

## Value for the ISV partner

| Value | Pain point addressed |
|---|---|
| One place for the overall picture of packages, versions and who runs them | P1 |
| Visual summaries and diagrams that can be read without command-line skills | P2 |
| Answers expressed in customers as well as orgs | P3 |

## Main goal

> **An ISV partner can see, in one visual place inside Salesforce, the current state of their 2GP packages: which packages and versions exist, how they relate, and which customers run each version.**

## How we will know it is achieved

**Measure:** the number of reference questions that a user answers correctly within the time limit.

**Target:** 4 out of 4, each in under 1 minute **[A7]**.

| # | Reference question |
|---|---|
| Q1 | How many packages do we have, and what is the latest version created of each one? |
| Q2 | For a given package, how many active customers **[A5]** are on each version? |
| Q3 | For a given version, which customers and which of their orgs are running it? |
| Q4 | For a given version, which version does it descend from, and which packages does it depend on? |

**Test conditions:**

- **When:** in the acceptance test of the MVP.
- **Who:** at least one person who knows 2GP packaging and has had no prior walkthrough of KYP.
- **Tools:** KYP only, with no command line, hand-written query or other app.
- **Correct:** the answer matches what the Salesforce source records show at the time of the test.
- **Data:** one Dev Hub with at least two 2GP managed packages, one depending on the other; at least three versions of one package, linked by ancestry; and installations in at least three subscriber orgs, spread over at least two versions and belonging to two customers, one of them with two orgs **[A12]**.

There is no measurement of how long these answers take today, so this measure shows whether the goal is met, not how much it improves on the current situation **[A8]**.

## Outside this idea

Assumed to be outside the product for now **[A9]**:

- Changing anything in packages or subscriber orgs, such as push upgrades or licence management.
- First-generation (1GP), unmanaged and unlocked packages.
- Analytics about how customers use the package.

The detailed list of what is in and out of the MVP belongs to the PRD (KYP-9).

## Assumptions not yet validated

| ID | Assumption | How to validate it |
|---|---|---|
| A1 | Getting the overall picture today requires combining several sources and tools by hand | Interview ISV partners and follow how they answer Q1 to Q4 |
| A2 | Product, release and support roles need these answers, find the current outputs hard to read, and decide more slowly because of it | Interview people in those roles |
| A3 | Partners reason about customers more than about orgs | Same interviews |
| A4 | A customer may have several orgs, and each subscriber org can be linked to its customer, probably through LMA licence records | Check the available data while writing the PRD |
| A5 | An active customer is one with the package currently installed in at least one of its production orgs. It counts once on each version installed in those orgs | Product decision to confirm |
| A6 | A simpler, summary-first, customer-based view adds enough over Package Visualizer to justify KYP | Try Package Visualizer against Q1 to Q4, then decide |
| A7 | 4 out of 4 questions in under 1 minute each is the right target | Product decision to confirm |
| A8 | Answering these questions today takes noticeably longer than the target | Time the current way of answering them |
| A9 | KYP only shows information, and only about 2GP managed packages | Product decision to confirm |
| A10 | A tool inside Salesforce can obtain package, version, dependency, subscriber and customer data, even if the Dev Hub and the LMA are in different orgs | Feasibility check before the MVP scope is closed |
| A11 | "Packages created in the org", as worded in the task input, means the packages registered in the partner's Dev Hub | Product decision to confirm |
| A12 | The subscriber orgs and installations needed for the acceptance test can be set up | Try it before the MVP scope is closed |

## Sources

| ID | Source | How it was checked |
|---|---|---|
| S1 | [Tooling API: Package2](https://developer.salesforce.com/docs/platform/api-tooling/references/tooling-objects/tooling-package2.html) | Search result summary only |
| S2 | [Tooling API: Package2Version](https://developer.salesforce.com/docs/platform/api-tooling/references/tooling-objects/tooling-package2version.html) | Search result summary only |
| S3 | [Salesforce CLI: help text of the package ancestry command](https://raw.githubusercontent.com/salesforcecli/plugin-packaging/main/messages/package_displayancestry.md) | Page fetched |
| S4 | [Salesforce CLI: help text of the version dependencies command](https://raw.githubusercontent.com/salesforcecli/plugin-packaging/main/messages/package_version_displaydependencies.md) | Page fetched |
| S5 | [Object reference: PackageSubscriber](https://developer.salesforce.com/docs/atlas.en-us.object_reference.meta/object_reference/sforce_api_objects_packagesubscriber.htm) | Search result summary only (the site refused direct reading) |
| S6 | [Trailhead: Manage Your Licenses](https://trailhead.salesforce.com/content/learn/modules/appexchange_licensing/appexchange_licensing_manage) | Page fetched |
| S7 | [AppExchange: Package Visualizer + ISV Tooling](https://appexchange.salesforce.com/appxListingDetail?listingId=a0N3u00000MSnbuEAD) | Page fetched |
| S8 | [GitHub: Package-Visualizer README](https://github.com/ronitnuguru/Package-Visualizer) | Page fetched |
