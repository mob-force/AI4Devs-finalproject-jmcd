> Detalla en esta sección los prompts principales utilizados durante la creación del proyecto, que justifiquen el uso de asistentes de código en todas las fases del ciclo de vida del desarrollo. Esperamos un máximo de 3 por sección, principalmente los de creación inicial o  los de corrección o adición de funcionalidades que consideres más relevantes.
Puedes añadir adicionalmente la conversación completa como link o archivo adjunto si así lo consideras


## Índice

1. [Descripción general del producto](#1-descripción-general-del-producto)
2. [Arquitectura del sistema](#2-arquitectura-del-sistema)
3. [Modelo de datos](#3-modelo-de-datos)
4. [Especificación de la API](#4-especificación-de-la-api)
5. [Historias de usuario](#5-historias-de-usuario)
6. [Tickets de trabajo](#6-tickets-de-trabajo)
7. [Pull requests](#7-pull-requests)

---

## 1. Descripción general del producto

**Prompt 1:**

Claude Code, Claude Sonnet 5.5 ([sesión completa](prompts/2026-11-26-product-idea.md))

```text
@"product-owner (agent)" implement the KYP-8 

<pasted_content>
The project should implement a tool build within Salesforce to have:
- Summary information of packages created in the org in the more visual way possible
  - Number of packages
  - Active customers per versions in package
  - Latest version created per package
- List of package and package details including related versions or subscribed customers
  - View of the package dependency
- List of versions and version details including related customers and orgs by version
  - View of the hierarchy tree of the versions
</pasted_content>
```

**Prompt 2:**

Claude Code, Claude Sonnet 5.5 ([sesión completa](prompts/2026-11-26-product-idea.md))

> Nota: los ADR 0006 y 0007 que menciona este prompt se eliminaron en KYP-15 y sus decisiones están en [docs/product/idea.md](docs/product/idea.md). Hoy el número 0006 identifica otro ADR.

```text
<pasted_content>
1. Should KYP replace Package Visualizer, complement it, or do something else? It should be an alternative in the market, free as the Package Visualizer but with a better UX
2. Is an active customer one with the package installed in at least one production org? That's the definition
3. Is 4 of 4 questions, each under 1 minute, the right target? Yeah, make things easy for a user is the main goal of KYP
4. Is KYP view-only, excluding push upgrades, licence management, usage analytics and other package types? In the MVP phase yes
5. Is "the org" your Dev Hub, and is the License Management App in the same org? Yeah, that's the assumption. Future technical definition can cover other escnearios, but to simplify the MVP that's the assumption
6. Must the dependency view and version tree be in the MVP? Yeah, makes things easy and visual for user, what is one of the goals
7. Should "latest version created" include betas (F3)? Yeah, both should be displayed, latest promoted version and latest beta version
8. Which role at the ISV partner is the main user? Package Owner
9. Do you adopt ADR 0006 and ADR 0007? ADR 0007 is marked Proposed. Both needs to be adopted


Apply the required changes, commit the changes and push it to github
</pasted_content>
```

**Prompt 3:**

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

### **2.2. Descripción de componentes principales:**

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

### **2.4. Infraestructura y despliegue**

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

### **2.5. Seguridad**

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

### **2.6. Tests**

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

---

### 3. Modelo de Datos

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

---

### 4. Especificación de la API

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

---

### 5. Historias de Usuario

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

---

### 6. Tickets de Trabajo

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

---

### 7. Pull Requests

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**
