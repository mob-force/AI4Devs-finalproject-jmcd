# Salesforce platform guardrails

Platform limits and rules that designs must respect. How to cite and change principles is in [patterns.md](patterns.md#using-the-principles).

## Limits and scale

| ID | Rule | Why |
|---|---|---|
| P-28 | Every path stays within the [limits](#key-limits) for 200 records at once and for the data volume the design states. | A limit exception cannot be handled [S1] and rolls back the transaction [S2]. |
| P-29 | No SOQL, DML, callout or job enqueue inside a loop. | Each iteration spends a limit. |
| P-30 | A query on an object that can grow is bounded and filters on an indexed field (ID, name, owner, relationship, audit date, external ID, unique), matching under 10% of rows as a guide [S3]. | Non-selective queries perform badly, above all in triggers [S3]. |
| P-31 | Large lists are paged from the last row read, not by growing `OFFSET`; large results use a SOQL `for` loop or run asynchronously. | `OFFSET` stops at 2,000 rows [S4]; the loop saves heap [S3]. |
| P-32 | Work that may exceed synchronous limits runs asynchronously (Queueable by default, Batch Apex for large record sets) and is safe to run again. | Higher limits [S1]; failed work can be retried. |
| P-33 | No user owns more than 10,000 records of an object, and no parent has 10,000 or more children, unless the design shows the effect. | Such skew slows sharing recalculation [S5] [S6]. |

## Transactions

| ID | Rule | Why |
|---|---|---|
| P-34 | Each design states its transaction boundaries and what remains after a failure; DML on setup objects (e.g. `User`) is kept apart from other DML. | All or nothing [S2]; mixed DML fails [S7]. |
| P-35 | Callouts run before any DML, email or job enqueue; work started by a trigger calls out asynchronously. | Pending work blocks callouts [S8]; jobs must declare them [S9]. |
| P-36 | Designs follow the order of execution (before-save flows, before triggers, validation, save, after triggers, later automation and roll-ups, commit, asynchronous work) [S10] and expect cascade deletes to skip child triggers [S11]. | Logic at the wrong step sees wrong data or never runs. |

## Security, code and release

| ID | Rule | Why |
|---|---|---|
| P-37 | Every class declares its sharing, `with sharing` by default; `without sharing` is confined to a small class whose reason the design states. | Defaults differ by context and version [S12]. |
| P-38 | Every query and DML states its access mode: user mode by default, system mode only where the design says why; never `WITH SECURITY_ENFORCED`. | User mode enforces permissions [S13]; AppExchange bans that clause [S14]. |
| P-39 | No secrets in code, ordinary fields or logs; callouts use named and external credentials; session IDs never leave the org. | The platform authenticates [S15]; packages may not export session IDs [S16]. |
| P-40 | SOQL is static with bind variables; dynamic SOQL, if unavoidable, binds or escapes all user input. | Prevents SOQL injection [S17]. |
| P-41 | Permission sets grant access to app objects, fields, classes and tabs, with the least access needed. | Access is reviewable. |
| P-42 | Every design would pass an AppExchange security review, although distribution is undecided (D7 in `docs/product/idea.md`). | Costly to add later. |
| P-43 | All Apex uses API version 67.0 or later. | Older versions have looser defaults [S12] [S13]. |
| P-44 | A member is `global` only when code outside the namespace must call it. | Released managed `global` code cannot be removed or changed [S18]. |
| P-45 | Apex tests cover at least 75% of the code, and every trigger. | Needed to release 2GP on AppExchange [S19]. |

## Key limits

Per transaction, without the separate limits of certified managed packages [S1].

| Limit | Synchronous | Asynchronous |
|---|---|---|
| SOQL queries / rows retrieved | 100 / 50,000 | 200 / 50,000 |
| DML statements / rows | 150 / 10,000 | 150 / 10,000 |
| CPU time | 10,000 ms | 60,000 ms |
| Heap (Summer '26 docs said 6 and 12 MB) | 10 MB | 25 MB |
| Callouts / total callout time | 100 / 120 s | 100 / 120 s |
| Jobs added with `System.enqueueJob` | 50 | 1 |

- Triggers receive chunks of 200 records (2,000 for platform and change events); trigger recursion depth is 16 [S1]. A callout times out after 10 s unless set higher [S8].
- Org-wide: 250,000 asynchronous executions per 24 hours, or user licences x 200 if greater; 5 batch jobs queued or active, 100 more held; 100 scheduled classes [S1].
- **Not verified** (search result summary only): a custom object allows 2 master-detail relationships and 40 relationships in total.

## Sources

Apex Developer Guide unless the title says otherwise; checked on 2026-11-28 in Winter '27 (S4 to S6, S14, S16 and S19 in Summer '26).

[S1] [Governor limits](https://developer.salesforce.com/docs/platform/apex-dev/references/apex-dev/apex-gov-limits.html) · [S2] [Transactions](https://developer.salesforce.com/docs/platform/apex-dev/references/apex-dev/apex-limits-intro.html) · [S3] [Large queries](https://developer.salesforce.com/docs/platform/apex-dev/references/apex-dev/langcon-apex-soql-vlsq.html) · [S4] [SOQL OFFSET](https://developer.salesforce.com/docs/platform/salesforce-soql-sosl/guide/sforce-api-calls-soql-select-offset.html) · [S5] [Ownership skew](https://developer.salesforce.com/docs/platform/draes/guide/draes-group-membership-data-skew.html) · [S6] [Parent-child skew, on accounts](https://developer.salesforce.com/docs/platform/draes/guide/draes-object-relationships-parent-child-data-skew.html) · [S7] [Mixed DML](https://developer.salesforce.com/docs/platform/apex-dev/references/apex-dev/apex-dml-non-mix-sobjects.html) · [S8] [Callout limits](https://developer.salesforce.com/docs/platform/apex-dev/references/apex-dev/apex-callouts-timeouts.html) · [S9] [Queueable](https://developer.salesforce.com/docs/platform/apex-dev/references/apex-dev/apex-queueing-jobs.html) · [S10] [Order of execution](https://developer.salesforce.com/docs/platform/apex-dev/references/apex-dev/apex-triggers-order-of-execution.html) · [S11] [Operations without triggers](https://developer.salesforce.com/docs/platform/apex-dev/references/apex-dev/apex-triggers-ignoring-operations.html) · [S12] [Sharing keywords](https://developer.salesforce.com/docs/platform/apex-dev/references/apex-dev/apex-classes-keywords-sharing.html) · [S13] [Access mode](https://developer.salesforce.com/docs/platform/apex-dev/references/apex-dev/apex-classes-enforce-usermode.html) · [S14] [Secure coding: CRUD and FLS](https://developer.salesforce.com/docs/platform/secure-coding/guide/secure-coding-access-control-protect-from-crud-fls-vulnerabilities.html) · [S15] [Named credentials](https://developer.salesforce.com/docs/platform/apex-dev/references/apex-dev/apex-callouts-named-credentials.html) · [S16] [Secure coding: session IDs](https://developer.salesforce.com/docs/platform/secure-coding/guide/secure-coding-considerations-sessionid.html) · [S17] [SOQL injection](https://developer.salesforce.com/docs/platform/apex-dev/references/apex-dev/pages-security-tips-soql-injection.html) · [S18] [Global in managed packages](https://developer.salesforce.com/docs/platform/apex-dev/references/apex-dev/apex-manpkgs-global-best-practices.html) · [S19] [2GP code coverage](https://developer.salesforce.com/docs/platform/pkg2-dev/guide/sfdx-dev-dev2gp-code-coverage.html)
