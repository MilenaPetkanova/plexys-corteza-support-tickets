# **Homework Task** 

Front-end / Full-stack Engineer 

## About this task 

At Plexys we build enterprise applications on top of Corteza, an open-source low-code platform. Day to day that means configuring the Corteza back end and building rich front-end experiences against it. This task is that work in miniature: you will configure a small data module inside Corteza, then build a single-page application that manages its records. 

You have almost certainly not used Corteza before. That is deliberate. A large part of what we assess is how you pick up an unfamiliar platform from its documentation and its source, and ship something clean against it. 

Corteza provides first-party client tooling and multiple supported ways to serve a custom application. We have deliberately not named either. Finding them, and deciding whether to use them, is part of the exercise. **If you re-implement something the platform already provides, tell us why.** 

**Expected effort:** roughly 4–5 hours. Please do not spend significantly more. We would rather see clean, honest work inside the budget than an over-polished submission. If you run short, leave notes on what you would do next — those notes count in your favour. 

**Tooling:** use whatever you normally use, including AI assistants. We do the same. In the review session you will be asked to walk through your decisions, trace a failure path in your own code, and say which behaviours you observed and which you assumed. That conversation matters more to us than how the code was typed. 

### **Reference material** 

- Documentation: https://docs.cortezaproject.org/ 

- REST API reference and live spec: https://latest.cortezaproject.org/api/docs/ 

- Source: the Corteza monorepo on GitHub. Where the docs are thin, the source is authoritative. 

**plexys.eu** 

6 Shipka Street, 1504 Sofia, Bulgaria +359 XXX XXX XXX 



## Part 1 — Back end 

You need a running Corteza instance with admin access. 

Follow the official Docker deployment guide (server + Postgres) and complete the first-run setup wizard in your browser. 

State in your documentation which Corteza version you ran and why you picked it. 

### **Module configuration** 

Using the Corteza admin / Compose builder UI — no code for this part — create (or reuse) a namespace, for example “Plexys Homework”. Inside it create a module named “Support Ticket” with these fields: 

|**Field label**|**Type**|**Notes**|
|---|---|---|
|**Subject**|String|Required|
|**Description**|String (multi-line)|Optional|
|**Status**|Select|Required. Options: New, In Progress, Resolved, Closed|
|**Priority**|Select|Required. Options: Low, Medium, High, Urgent|
|**Due Date**|Date/Time|Optional|



Do not re-author created / updated / owner fields. Corteza maintains those as system fields automatically; use them. 

Create a record or two through the Compose UI so you know the module works. 

**Bonus:** add a second (or even third) module related to Support Ticket — Customer, Service, or anything else that makes sense to you. 

**plexys.eu** 

6 Shipka Street, 1504 Sofia, Bulgaria +359 XXX XXX XXX 



## Part 2 — Front end 

Build a single-page application that manages Support Ticket records against your Corteza instance. 

### **Required functionality** 

- List existing tickets in a readable view — table or cards, your call. 

- Create a new ticket via a modal. 

- Edit an existing ticket via a modal. 

- Delete a ticket. 

- **The application acts as the signed-in user.** Records created through your app must carry that user’s real identity, so the platform’s permissions and audit trail stay meaningful. 

### **How you serve it** 

Your call — but this is one of the things we look at closely. Corteza supports serving a custom application in multiple ways. Say which path you chose and why in your documentation. 

### **Technical requirements** 

- **Vue 3 with the Composition API.** An alternative is acceptable if you explain the reasoning. 

- Component library (PrimeVue, Vuetify, Element Plus, …) or hand-rolled styling — your call. We care about the result, not the toolkit. 

- The app should be usable at narrow widths and keyboard-operable. Basic accessibility is expected, not bonus. 

**Bonus:** CRUD for your second module, with the relationship surfaced in the UI — for example picking a related Customer when creating a ticket. 

**plexys.eu** 

6 Shipka Street, 1504 Sofia, Bulgaria +359 XXX XXX XXX 



## Documentation 

Write a short document covering: 

- Architecture of your solution. 

- Design patterns and technical decisions — what you chose and why, not a feature list. 

- User guide — enough for a real end user. 

- Admin guide — configuring and operating it: module, instance, authentication, configuration. 

- Known limitations and what you would do next. 

**Expected format:** a PDF of no more than 5–6 pages, screenshots included. Please stick to the format — it is part of what we assess. 

## Handover 

Give our reviewers everything they need to assess your work without coming back to you: 

- A public Git repository, or access to a private one. 

- Setup instructions that work from a clean clone. 

- Configuration examples that match your own instructions. 

- A reachable running instance, or complete steps to run it locally, plus any credentials needed. 

**Expected format:** an email with the repository URL and the documentation PDF attached. 

**plexys.eu** 

