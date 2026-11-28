# Naming and code conventions

How to cite and change principles is in [patterns.md](patterns.md#using-the-principles). Object names below only illustrate the rules; they are not the data model.

## Principles

| ID | Rule | Why |
|---|---|---|
| P-19 | Names are in English, avoid abbreviations and use the terms of `docs/product/idea.md` (package, version, subscriber org, customer). | One word per concept, from product to code. |
| P-20 | Object and field API names are capitalised words joined by underscores; object names are singular (`Package_Version__c`). | Names can be guessed and read the same everywhere. |
| P-21 | Boolean fields start with `Is_` or `Has_`, a relationship field is named after what it points to, and the external ID of P-15 is `Source_Id__c`. | The name says what the field holds. |
| P-22 | Every custom object and field has a description saying what it holds and, for loaded data, where it comes from. | The meaning travels with the metadata. |
| P-23 | An Apex class or trigger name follows the [table below](#apex-names). | The layer, and so the rules that apply, is visible from the name. |
| P-24 | Classes are `UpperCamelCase`, methods `lowerCamelCase` starting with a verb, variables meaningful `lowerCamelCase`, and constants `UPPER_SNAKE_CASE`; Selector methods start with `selectBy` or `selectAll`. | Follows the Java style Salesforce recommends for Apex [S1]. |
| P-25 | A Lightning web component name is `lowerCamelCase`, letters and digits only, and says what it shows. | The platform requires a lowercase first letter and bans hyphens [S2]; leaving out underscores is a project choice. |
| P-26 | No record IDs, URLs or environment values in code (configuration goes in custom metadata, except the trigger switch of P-48), and no user-facing text in code (it goes in custom labels). | Values differ between orgs, and text can change or be translated without code. |
| P-27 | A test class builds its own data (in memory when P-50 needs no database) and asserts behaviour, including 200 records for bulk paths and a user without access for secured paths. | Coverage alone does not show that code works. |

## Apex names

`<Objects>` is the plural of the object's name without underscores or suffix (`PackageVersions`); `<Object>` is its singular.

| Kind | Pattern | Example |
|---|---|---|
| Service | `<Objects>Service`, or `<UseCase>Service` when it spans objects | `PackageVersionsService` |
| Domain | `<Objects>` | `PackageVersions` |
| Selector | `<Objects>Selector` | `PackageVersionsSelector` |
| Unit of work | `UnitOfWork`, one shared class | `UnitOfWork` |
| Client of an external API | `<Api>Client` | `LicensingClient` |
| Trigger | `<Object>Trigger` | `PackageVersionTrigger` |
| Trigger handler | `<Objects>TriggerHandler` | `PackageVersionsTriggerHandler` |
| Lightning component controller | `<View>Controller` | `OverviewController` |
| REST resource | `<Resource>RestResource` | `PackagesRestResource` |
| Asynchronous job | `<UseCase>Queueable`, `<UseCase>Batch` or `<UseCase>Scheduler` | `PackageRefreshQueueable` |
| Custom exception | `<Name>Exception` (the suffix is required by the platform [S3]) | `PackageRefreshException` |
| Test | `<ClassName>Test` | `PackageVersionsServiceTest` |

The trigger switch of P-48 is the custom setting `Trigger_Setting__c`, with one checkbox `Is_<Object>_Trigger_Disabled__c` per handler.

## Sources

Checked on 2026-11-28.

[S1] [Apex naming conventions](https://developer.salesforce.com/docs/platform/apex-dev/references/apex-dev/apex-classes-naming-conventions.html) · [S2] [Lightning web component folder](https://developer.salesforce.com/docs/platform/lwc/guide/create-components-folder.html) · [S3] [Create custom exceptions](https://developer.salesforce.com/docs/platform/apex-dev/references/apex-dev/apex-exception-custom.html)
