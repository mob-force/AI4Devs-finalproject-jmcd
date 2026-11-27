# Know Your Package (KYP): product idea and main goal

- **Ticket:** KYP-8 (Epic KYP-7, Product Documentation)
- **Decisions:** statements marked **[D1]** to **[D8]** are confirmed product decisions, explained in [Product decisions](#product-decisions).
- **Assumptions:** statements marked **[A…]** have not been validated. They are listed in [Assumptions](#assumptions-not-yet-validated). Numbers missing from that list were assumptions that are now product decisions.
- **Sources:** facts about Salesforce are marked **[S1]** to **[S9]** and listed in [Sources](#sources). S1 to S8 were checked on 2026-11-26 and S9 on 2026-11-27.

## In short

- **What it is:** a free tool, used inside Salesforce, that gives a visual and up-to-date picture of a partner's second-generation managed packages (2GP). It is an alternative to Package Visualizer with a better user experience as its aim **[D1]**.
- **Who it is for:** Salesforce ISV partners that build and distribute 2GP managed packages. The main user is the Package Owner **[D2]**.
- **Why it is needed:** a partner needs to know which package versions exist and who is running them. We believe that getting this overall picture today means combining several sources and tools by hand **[A1]**.

## Terms

| Term | Meaning in this document |
|---|---|
| ISV partner | An independent software vendor: a company that builds apps on Salesforce and distributes them to customers as packages |
| Package Owner | The person at the ISV partner who is responsible for its packages, and the main user of KYP |
| 2GP | Second-generation managed package, which is released in successive versions |
| Promoted version | A package version that has been promoted to released status, which cannot be undone **[S9]** |
| Beta version | A package version that has not been promoted |
| Dev Hub | The Salesforce org where the partner's 2GP packages and versions are registered |
| Subscriber org | A Salesforce org, production or sandbox, where one of the partner's packages is installed |
| Customer | A company that uses a package. It may have several subscriber orgs **[A4]** |
| Active customer | A customer that currently uses a package, as defined in [D3](#d3-what-an-active-customer-is) |
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

An ISV partner has no quick, overall and readable answer to the question **"what have we built, and who is running what?"**. The Package Owner is the main person who needs that answer **[D2]**.

No user research has been done, so the pain points are hypotheses:

| ID | Pain point |
|---|---|
| P1 | **Scattered information.** Answering means moving between the Dev Hub, the command line, queries and the LMA **[A1]** |
| P2 | **Hard to read.** Command output, graph code and record lists take effort to interpret, above all for people who do not work with the command line, such as product, release or support roles **[A2]** |
| P3 | **Orgs instead of customers.** Installations are recorded per org **[S5]**, while the partner reasons about customers **[A3]** |

We expect these to slow down the Package Owner's decisions such as which versions to keep supporting, which customers should upgrade and how to handle a support case **[A2]**.

## Existing alternative: Package Visualizer

Package Visualizer already covers much of this idea, so it must be taken into account before building anything.

- Its AppExchange listing presents it as a free Salesforce Labs app to view and manage the 2GP and unlocked packages linked to a Dev Hub. It includes version ancestry, push upgrades, App Analytics log files and License Management App compatibility **[S7]**.
- The README of its repository, held in a personal GitHub account that we have not confirmed as official, also describes subscriber lists filtered by version, charts of how subscribers are spread across versions, a tree of version ancestry and dependencies, and licences with their associated account **[S8]**.

Neither source mentions a summary with the latest version of each package, or counting customers (not orgs) per version. Not being mentioned does not prove that it is missing, and the app has not been tried.

KYP is intended as an alternative to Package Visualizer: free as well, with a better user experience **[D1]**. We expect that better experience to come from a simpler, summary-first view expressed in terms of customers. That KYP can deliver a noticeably better experience is **not validated** **[A6]**.

## Proposed solution

Know Your Package is a free tool used **inside Salesforce** **[D7]** that presents the information about the partner's own packages, those registered in its Dev Hub, visually. The MVP assumes that the License Management App is in that same org; other setups may be covered by a later technical definition **[D4]**. The product depends on the information being obtainable from within Salesforce **[A10]**. It works at three levels:

1. **Overview:** all the partner's packages at a glance.
2. **Package:** one package, with its versions, dependencies and customers.
3. **Version:** one version, with its place in the version hierarchy and the customers and orgs running it.

What is in and out of the MVP is in [MVP scope](#mvp-scope). The detailed features of each level and their priority belong to the PRD (KYP-9). The feature list received as input for this task is recorded word for word in [the session prompt log](../../prompts/2026-11-26-product-idea.md) (Prompt 3), as input for that task.

## Value for the ISV partner

| Value | Pain point addressed |
|---|---|
| One place for the overall picture of packages, versions and who runs them | P1 |
| Visual summaries and diagrams that can be read without command-line skills | P2 |
| Answers expressed in customers as well as orgs | P3 |

## Main goal

> **A Package Owner at an ISV partner can easily see, in one visual place inside Salesforce, the current state of their 2GP packages: which packages and versions exist, how they relate, and which customers run each version.**

Making this easy for the user is the heart of the goal **[D8]**, and the measure below tests it.

## How we will know it is achieved

**Measure:** the number of reference questions that a user answers correctly within the time limit.

**Target:** 4 out of 4, each in under 1 minute **[D6]**.

| # | Reference question |
|---|---|
| Q1 | How many packages do we have, and what are the latest promoted version and the latest beta version **[A13]** of each one? |
| Q2 | For a given package, how many active customers **[D3]** are on each version **[A5]**? |
| Q3 | For a given version, which customers and which of their orgs are running it? |
| Q4 | For a given version, which version does it descend from, and which packages does it depend on? |

**Test conditions:**

- **When:** in the acceptance test of the MVP.
- **Who:** at least one person who knows 2GP packaging and has had no prior walkthrough of KYP.
- **Tools:** KYP only, with no command line, hand-written query or other app.
- **Correct:** the answer matches what the Salesforce source records show at the time of the test.
- **Data:** one Dev Hub with at least two 2GP managed packages, one depending on the other; at least three versions of one package, linked by ancestry; and installations in at least three subscriber orgs, spread over at least two versions and belonging to two customers, one of them with two orgs; the customer with two orgs has both as production orgs on the same version **[A12]**.

There is no measurement of how long these answers take today, so this measure shows whether the goal is met, not how much it improves on the current situation **[A8]**.

## MVP scope

The MVP only shows information, about 2GP managed packages, and includes the view of package dependencies and the version hierarchy tree **[D5]**. These are left out of this phase:

- Changing anything in packages or subscriber orgs, such as push upgrades or licence management.
- First-generation (1GP), unmanaged and unlocked packages.
- Analytics about how customers use the package.

The detailed list of what is in and out of the MVP belongs to the PRD (KYP-9).

## Product decisions

Unless a decision says otherwise, reasons for rejecting alternatives are the assessment of whoever drafted the decision (the Product Owner agent or the assistant), not statements of the person who confirmed it.

### D1: A free alternative to Package Visualizer with a better user experience

- **Why:** Package Visualizer already covers much of this idea. Without a position towards it, there is no reason to build KYP and nothing to guide what the MVP should do differently.
- **Trade-offs:** ease of use becomes the criterion for choosing and designing features. KYP overlaps with an existing app, so it has to be clearly easier to use to be chosen, which is not validated **[A6]**. Being free, it brings no direct revenue.
- **Rejected:**
  - Replacing Package Visualizer: it would call for matching all its features, including those outside the MVP.
  - Complementing it: partners would have to use both, and the user experience of the overlapping views would not change.
  - Charging for KYP: a paid product would have to justify its price against a free one.

### D2: The Package Owner is the main user

- **Why:** several roles at an ISV partner may need this information. A better user experience **[D1]** cannot be designed or tested without knowing whose experience comes first.
- **Trade-offs:** user stories and design choices have one primary user to serve, and other roles may be served less well. What the Package Owner needs is not validated **[A2]**.
- **Rejected:**
  - Developers or release engineers: they are likely to be comfortable with the command line, where much of this information is already available.
  - Product or support roles: they may need these answers, but are not responsible for the packages.
  - No primary user: nothing would settle conflicting needs.

### D3: What an active customer is

- **Decision:** an active customer is one with the package currently installed in at least one of its production orgs. How it is counted on each version is not yet confirmed **[A5]**.
- **Why:** the main goal and Q2 count customers per version, so the term needs one meaning.

### D4: One org for the Dev Hub and the License Management App

- **Decision:** for the MVP, the org that KYP describes is the partner's Dev Hub, and the License Management App (LMA) is in that same org. A later technical definition can cover other setups.
- **Why:** package and version records are in the Dev Hub, and customer and licence information is in the LMA. Assuming one org keeps the MVP simple.
- **Trade-offs:** partners that keep them in different orgs are not covered by the MVP. That all the data can be obtained within one org is still to be verified **[A10]**.
- **Rejected:**
  - Supporting separate orgs from the start: it adds cross-org access to the MVP.
  - Leaving out LMA data: answering in terms of customers, part of the main goal, probably needs it **[A4]**.

### D5: A view-only MVP for 2GP managed packages

- **Decision:** the [MVP scope](#mvp-scope).
- **Why:** the MVP is small (at most 5 user stories), and the main goal needs dependencies and the version hierarchy. Seeing them visually makes things easier for the user.
- **Trade-offs:** the scope stays tied to the reference questions and KYP changes nothing in packages or subscriber orgs. Users need other tools to act on what they see. KYP's MVP lacks features that Package Visualizer lists, such as push upgrades. Both diagrams take room in a small MVP.
- **Rejected:**
  - Including push upgrades or licence management: acting on data adds risk and scope that the main goal does not need.
  - Covering other package types: it widens the data and cases to handle without serving the main goal.
  - Leaving dependencies or the version tree for later: the main goal and its measure include them.

### D6: How success is measured

- **Decision:** success is measured with the reference questions, target and test conditions in [How we will know it is achieved](#how-we-will-know-it-is-achieved).
- **Why:** making things easy for the user is the heart of the main goal **[D8]**, and there are no users, user research or measurement of the current situation to build another measure on.
- **Trade-offs:** the measure can be tested with the MVP alone, and each kind of view requested for the product is covered by a question. It shows that KYP can answer the questions, not that partners want it or that it saves them time. The target was set without a baseline **[A8]**. Q4 makes dependencies and the version hierarchy necessary in the MVP **[D5]**.
- **Rejected:**
  - Adoption, such as the number of partners using KYP: there are no users and no means to reach such a number within the project.
  - Time saved compared with today: there is no baseline. It can replace the time limit once the current way of answering has been timed.

### D7: KYP is used inside Salesforce

- **Decision:** the ISV partner uses KYP inside Salesforce. This says where the product is used and chooses no technology, architecture, data source or way of distributing it.
- **Why:** the input for the product asked for a tool built within Salesforce, without giving reasons. Where the product lives shapes who can use it, which data it can reach and how it compares with existing tools, and it is costly to reverse.
- **Trade-offs:** we assume partners benefit from having the information where they already manage their packages, without another application to sign in to. KYP can only show what can be obtained from within Salesforce **[A10]**, and competes directly with Package Visualizer, which also works there **[D1]**.
- **Open:** which org the tool runs in and how a partner would install it.
- **Rejected:**
  - A web application outside Salesforce: it goes against the input, and partners would have to give an external service access to their org data.
  - A command-line plugin: it goes against the input and would not help users who do not work with the command line.

### D8: The main goal is easy visibility

- **Decision:** the [main goal](#main-goal) is easy visibility.
- **Why:** every requirement has to support one main goal and the MVP has to fit in 5 user stories, so the goal fixes what the MVP can contain and is costly to change later. Making things easy for the user was confirmed as its heart.
- **Rejected:**
  - Moving customers to the latest version: it would call for acting on subscriber orgs, which was not asked for, and its result depends on customers over a period longer than an MVP test.
  - One goal per view: the product needs a single main goal.
  - A goal limited to who runs which version: smaller, but it leaves out the requested dependency and hierarchy views.

## Assumptions not yet validated

| ID | Assumption | How to validate it |
|---|---|---|
| A1 | Getting the overall picture today requires combining several sources and tools by hand | Interview ISV partners and follow how they answer Q1 to Q4 |
| A2 | The Package Owner, and product, release and support roles, need these answers, find the current outputs hard to read, and decide more slowly because of it | Interview people in those roles |
| A3 | Partners reason about customers more than about orgs | Same interviews |
| A4 | A customer may have several orgs, and each subscriber org can be linked to its customer, probably through LMA licence records | Check the available data while writing the PRD |
| A5 | An active customer counts once on each version installed in its production orgs | Product decision to confirm |
| A6 | A simpler, summary-first, customer-based view gives a noticeably better user experience than Package Visualizer | Try Package Visualizer against Q1 to Q4 and compare it with KYP |
| A8 | Answering these questions today takes noticeably longer than the target | Time the current way of answering them |
| A10 | A tool inside Salesforce can obtain package, version, dependency, subscriber and customer data when the Dev Hub and the LMA are in the same org | Feasibility check before the MVP scope is closed |
| A12 | The subscriber orgs and installations needed for the acceptance test can be set up | Try it before the MVP scope is closed |
| A13 | The "latest" promoted or beta version is the most recently created one of its kind | Confirm while writing the PRD |

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
| S9 | [Salesforce CLI: help text of the version promote command](https://raw.githubusercontent.com/salesforcecli/plugin-packaging/main/messages/package_version_promote.md) | Page fetched |
