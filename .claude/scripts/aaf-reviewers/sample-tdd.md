# TDD 0001: Sync of site visits from the scheduling system

- **Status:** Proposed
- **Sample:** a fictional design used to check the AAF reviewers. It is not part of Know Your Package.

## Context

A facilities company plans technician visits in an external scheduling system and wants to see them in Salesforce. Its customer sites already exist as `Site__c` records. About 500,000 visits are created each month. A visit belongs to exactly one site and means nothing without it. Technicians may only see visits to the sites assigned to them. When a visit is cancelled, its site manager is told by email, which is the only channel requested.

## Options

1. The scheduling system pushes changes to Salesforce.
2. Salesforce polls the scheduling system every night.

## Decision

Option 1.

### Data model

- `Visit__c` has a lookup to `Site__c`. The lookup is optional.
- Visits are never deleted.
- The list of visits of a site is filtered by the site name, copied into the text field `Visit__c.SiteName__c`.

### Interface

- The scheduling system calls a REST resource whose method is `global static String receiveVisits(String body)`. The address carries no version.
- Each call inserts the visits it receives. The scheduling system repeats a call when it gets no answer in time. A call can carry up to 2,000 visits.
- The method always answers with status 200 and a free text message, also when some or all visits are rejected.

### Processing

- An insert trigger on `Visit__c` handles each new record in turn: it queries the site, then calls the scheduling system to confirm receipt before the transaction ends.
- The class behind the REST resource and the trigger handler run `without sharing` and read and write every field without permission checks, so that nothing is hidden by mistake.
- The key for the confirmation call is kept in the custom field `SyncSetting__c.ApiKey__c`, which all users can read.

### Notifications

- Cancellation messages go through a plug-in framework: a `global` interface `INotificationChannel`, a factory, and custom metadata records that choose the implementation, so that SMS or chat channels can be added some day.
- A custom caching layer with its own object, `SiteCache__c`, keeps a copy of each site to speed up the email. It is refreshed by a scheduled job.

## Consequences

- Visits appear in Salesforce shortly after they are planned.
- The company has to maintain the interface and the notification framework.
