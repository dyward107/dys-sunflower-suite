We are going to keep everything we already have (Status, Case Type list, Contact Type list, Lead Attorney list, etc.) and simply re-wire where and how those items are stored and connected.
Below is a revised spec you can hand to Claude that:
	• Keeps all existing labels, options, and definitions
	• Adds the party/representation structure you need
	• Preserves all of the ideas from the prior message (correspondence log, relationships, discovery uploads, Court contact, etc.)

1. High-level design (in the existing Sunflower language)
Guiding rules
	1. Do not rename or delete any of the following existing concepts:
		○ Status (and all existing Status options)
		○ Case Type (Motor Vehicle Accident, Pedestrian-Vehicle, Product Liability, Premises Liability, etc.)
		○ Contact Type (Adjuster, TPA Agent, Corporate Representative, Insurance Broker/Agent, Defense Counsel, Plaintiff Counsel, Expert, Investigator/SIU, Medical Provider, Witness, Court Personnel, Mediator/Arbitrator, Vendor/Service Provider, Other, etc.)
		○ Lead Attorney list (Rebecca Strickland, Kelly Chartash, Kori Wagner, Elizabeth Bentley, Bill Casey, Marissa Merrill, etc.)
		○ Any other predefined enums or dropdown lists that already exist.
	2. The Case Intake sheet becomes the master “Case Setup” source for:
		○ Parties (Plaintiff, Defendant, etc.)
		○ Whether each party is Individual or Entity
		○ Which parties we represent
		○ All attorneys (including Lead Attorney and all other counsel), with full contact info and bar number
		○ All client/carriers and policy details (including which carrier retained us)
		○ All court contacts (venue, judge, clerk, staff attorney)
		○ Any other case-specific contacts (experts, witnesses, providers, etc.)
	3. The Correspondence Log will pull its list of contacts from the intake-based contacts and auto-populate email/phone/addresses based on:
		○ Case → Party → Contact relationships
		○ Case → Court contact (“Court” composite contact)
	4. The names of contact types, case types, statuses, etc. must not change. If Claude detects any mismatch between the spec and the codebase, it must:
		○ Keep the existing enum as the source of truth, and
		○ List its questions/assumptions for you instead of silently inventing new terms.

2. Case Intake structure – using existing terminology
Claude should restructure the Case Intake / Case Manager area into these logical sections, reusing existing fields and dropdowns wherever they already exist:
A. Case Information
	• Case Name – still auto-generated from primary parties.
	• CM Number – unchanged.
	• Lead Attorney – same dropdown of partners you work with.
	• Status – same Status dropdown as now.
	• Case Type – same existing list (Motor Vehicle Accident, Pedestrian-Vehicle, Product Liability, Premises Liability, Animal Bite, Medical Malpractice, Nursing Home Abuse, Sex Trafficking, Food Poisoning, Boating Accident, Construction Accident, etc.).
	• Case Sub-Type – if this already exists, preserve it; if not, add a simple optional text or dropdown, but do not change the Case Type options.
B. Venue / Court
We keep the visible fields you already have, but we organize them as a “Court” cluster and also store them as a case contact so they can be used in correspondence and document uploads.
On the intake form:
	• Court (free text or dropdown as it currently exists)
	• Judge
	• Clerk
	• Staff Attorney
Add:
	• Email fields for Clerk and Staff Attorney, and (if you like) an email for the Court or a generic chambers address.
In the data model:
	• Create one case contact with something like:
		○ Contact Type: Court Personnel (do not rename the type)
		○ “Court Name”
		○ Judge name
		○ Clerk name + email
		○ Staff Attorney name + email
	• This “Court” contact is where:
		○ Judicial orders can be uploaded
		○ Scheduling orders can be attached
		○ Granted motions to extend discovery and related orders can be attached
The Correspondence Log can then address “Court” and you can choose whether it’s to Judge/Clerk/Staff in the notes.

C. Parties & Representation
On the intake form, we keep Primary Plaintiff and Primary Defendant fields (for short caption automation) and the ability to Add Additional Plaintiff / Add Additional Defendant, but we expand the detail captured per party.
For each party:
	• Party Role: Plaintiff / Defendant / Co-Defendant / Non-Party (keep whatever roles currently exist; if new ones are needed, ask me if we should add but do not rename existing roles).
	• Individual vs Entity
		○ If Individual:
			§ First Name
			§ Last Name
			§ Mailing Address (street/city/state/zip)
			§ Checkbox: Employee of Defendant Entity
				□ If checked, link to the relevant corporate defendant.
		○ If Entity:
			§ Entity Name
			§ Principal Place of Business / Corporate Address
			§ Registered Agent name and address
	• Representation
		○ Checkbox: Our Firm Represents This Party
		○ If checked, associate the party with:
			§ The Lead Attorney and (me)
		○ For corporate defendants: ability to mark the individual defendant as an employee/driver of that entity (trucking scenario).
	• Corporate Defendant – Corporate Rep
		○ For any entity marked “Defendant”:
			§ A linked Corporate Representative contact:
				□ Contact Type: Corporate Representative
				□ First/Last name
				□ Email and phone
				□ Business address is the same as the entity’s address by default (but can be overridden if necessary).

D. Attorneys (including Lead Attorneys)
We keep the Lead Attorney dropdown exactly as is, but we also ensure all attorneys in the case are stored as contact records tied to parties.
For each attorney:
	• Contact Type: Defense Counsel or Plaintiff Counsel (using the existing Contact Type list).
	• First Name / Last Name
	• Firm Name
	• Firm Address
	• Bar Number
	• Phone
	• Email
	• Role in case – can be a simple text field or an additional small enum; do not rename the core Contact Type.
Every attorney is linked to one or more Parties:
	• Example: Plaintiff Counsel → linked to Plaintiff X
	• Our defense attorneys → linked to the defendant(s) we represent
The Lead Attorney field on the Case Info section should either:
	• Reference one of these attorney contacts, or
	• At minimum, be consistent with this list so it’s not storing two separate “versions” of the same person.
Name	Title	Email	Phone(s)	Bar Number
Katy Robertson	Attorney	katy.robertson@swiftcurrie.com	404.888.6247; 470.600.5990	243097
Leah Parker	Partner	leah.parker@swiftcurrie.com	470.639.4858; 470.600.5990	289199
Marissa Merrill	Partner	marissa.merrill@swiftcurrie.com	470.639.4861; 470.600.5990	216039
Kori Wagner	Partner	kori.wagner@swiftcurrie.com	404.888.6191; 470.600.5990	155438
Rebecca Strickland	Partner	rebecca.strickland@swiftcurrie.com	404.888.6183; 470.600.5990	358183
Kelly Chartash	Partner	kelly.chartash@swiftcurrie.com	404.888.6169; 470.600.5990	602721
Bill Casey	Partner	bill.casey@swiftcurrie.com	404.888.6144; 470.600.5990	
Elizabeth L. Bentley	Partner	beth.bentley@swiftcurrie.com	404.888.6193; 470.600.5990	828730
Dynisha Harris	Associate	Dy.swiftcurrie.com	404.888.6137	158758
			470.600.5990

*all addresses and fax numbers for Dy's Attorney's the same:  1420 Peachtree Street, N.E., Suite 800 Atlanta, GA 30309-3231;  (fax) 404-888-6199  

E. Client / Carrier / Policy Information
This must stay consistent with what you already have; we are just organizing it around parties and contacts.
For each carrier / client involved:
	• Carrier Name (Client/Carrier)
	• Policy Number
	• Claim Number
	• Policyholder / Insured – linked to the appropriate party
	• Checkbox: Carrier That Retained Us (so it’s clear who hired the firm)
	• Adjuster / TPA:
		○ Stored as a contact with Contact Type Adjuster or TPA Agent
		○ Name
		○ Phone
		○ Email
These contacts are also in the contact pool that the Correspondence Log can select from.

F. Other Case Contacts (Experts, Providers, Witnesses, Vendors, etc.)
These still use the existing Contact Type list. No renaming.
For each case-specific contact:
	• Contact Type (Expert, Investigator/SIU, Medical Provider, Witness, Mediator/Arbitrator, Vendor/Service Provider, Other, etc.)
	• First/Last Name (or Entity Name)
	• Address
	• Phone
	• Email
	• Linked PartyID (if they are associated with a specific plaintiff or defendant)
You can still maintain a separate global contacts library (for your go-to experts, vendors, etc.) that you can import from. Once imported into a case, they live on the case intake/contacts side and become case-specific.

G. Discovery & Special Considerations
Keep the Discovery portion of the Case Intake form, including:
	• Existing checkboxes or fields regarding:
		○ Discovery open/close dates
		○ Extension requested / granted
		○ Any “special considerations” notes (keep that whole section as is).
Enhance it with:
	• File upload slots for:
		○ Scheduling Order
		○ Granted Motion to Extend Discovery
		○ Any order or filing that supports a discovery extension when that box is checked.
These documents should be logically tied either to:
	• The Court contact, and/or
	• The case’s Discovery settings section.

3. Correspondence Log – reusing Contact Type & Case Intake data
The Correspondence Log must:
	1. Pull its contact dropdown from the case-specific contacts created in the intake structure above, including:
		○ Parties (with their contact info)
		○ All attorneys (Defense Counsel, Plaintiff Counsel)
		○ Adjusters / TPA Agents
		○ Corporate Representatives
		○ Experts, Medical Providers, Witnesses, Vendors, Mediators, Court Personnel, etc.
	2. When a contact is chosen:
		○ Auto-fill phone/email/address from that contact record.
		○ Show their Contact Type and any linked party (e.g., “Plaintiff Counsel for Plaintiff Mitchell” or “Adjuster for Test Insurance”).
	3. Keep the existing Contact Type names. Do not change the select list you showed in the screenshot.
	4. Allow:
		○ Method (Call/Email/Letter/etc.)
		○ Date/time
		○ Subject / Short description
		○ Detailed notes
		○ Attachments (e.g., copies of letters, screenshots of emails, call memos).

4. Implementation instructions to Claude (pasteable)
You can give Claude something like this (feel free to copy/paste):

PROMPT FOR CLAUDE
We are revising Module A (Case Manager + Case Intake + Contacts + Correspondence) in Dy’s Sunflower Suite.
Non-negotiables
	1. Do NOT rename or delete any existing enums or dropdown values.
		○ Keep all Status options exactly as they are.
		○ Keep all Case Type options exactly as they are (Motor Vehicle Accident, Pedestrian-Vehicle, Product Liability, Premises Liability, Animal Bite, Medical Malpractice, Nursing Home Abuse, Sex Trafficking, Food Poisoning, Boating Accident, Construction Accident, etc.).
		○ Keep all Contact Type options exactly as they are (Adjuster, TPA Agent, Corporate Representative, Insurance Broker/Agent, Defense Counsel, Plaintiff Counsel, Expert, Investigator/SIU, Medical Provider, Witness, Court Personnel, Mediator/Arbitrator, Vendor/Service Provider, Other, etc.).
		○ Keep the Lead Attorney dropdown list and names exactly as they are.
	2. If you see any mismatch between this spec and the existing names in the code, treat the existing names as the source of truth.
		○ Do not silently introduce new labels.
		○ Summarize questions/assumptions in a short “Open Questions” section.
Objectives
	• Make the Case Intake sheet the single source of truth for:
		○ Parties (with roles, individual vs entity, addresses, employment linkages)
		○ Representation (who we represent, how defendants and corporate entities relate)
		○ Attorneys (including Lead Attorney) with full contact info + bar number
		○ Client/carriers and policy details, including which carrier retained us
		○ Court information (venue, judge, clerk, staff attorney, their emails)
		○ Other case-specific contacts (experts, providers, witnesses, vendors, mediators, etc.)
	• Make the Correspondence Log read from this intake-driven contacts list and auto-populate phone/email/address.
	• Preserve and wire in:
		○ Primary Plaintiff / Primary Defendant (for short-name automation)
		○ Special considerations section
		○ Discovery section, with uploads for scheduling orders and extension orders.
Required changes
	1. Update the data model (SQLite + TypeScript types) to support:
		○ Parties table with: role, individual/entity, first/last name, entity name, addresses, “employee of” link, “we represent this party” flag, primary plaintiff/defendant indicators.
		○ Contacts table using the existing Contact Type enum, with full contact info.
		○ Link tables that connect:
			§ Parties ↔ Contacts (e.g., plaintiff ↔ Plaintiff Counsel, defendant ↔ Defense Counsel, defendant entity ↔ corporate representative).
			§ Case ↔ Contacts for Court (“Court” composite contact) and miscellaneous contacts.
		○ Carrier/policy records linked to parties and contacts (adjusters/TPA).
	2. Update the Case Intake React components so that:
		○ Case Info (Status, Case Type, Lead Attorney, etc.) is preserved visually but wired into the new model.
		○ Parties can be added/edited with first/last names for individuals, entity vs individual selection, addresses, employee-of-entity checkbox, and “we represent this party” checkbox.
		○ Corporate defendants can have a linked Corporate Representative contact that shares the business address but has its own name/email/phone.
		○ Attorneys can be added with full contact info, bar number, and linked to parties; Lead Attorney dropdown references these or stays consistent with them.
		○ Court section captures court, judge, clerk, staff attorney, their emails, and creates/updates a “Court Personnel” contact record for the case.
	3. Update the Discovery portion of the intake to:
		○ Keep all existing fields and special considerations.
		○ Add file upload fields for the Scheduling Order and any discovery-extension-related filings/orders, storing them in a way that can be accessed from both the Court contact and any Discovery view.
	4. Update the Correspondence Log components to:
		○ Populate its contact dropdown from case contacts (parties, attorneys, adjusters, corporate reps, experts, providers, witnesses, vendors, mediators, court personnel, etc.).
		○ Auto-fill email/phone/address when a contact is selected.
		○ Retain all existing Contact Type labels and meanings.
	5. Provide complete, ready-to-replace files:
		○ Updated database schema/migrations.
		○ Updated TypeScript models/types.
		○ Updated React components for:
			§ Case Intake / Case Manager
			§ Parties/Contacts sub-sections
			§ Correspondence Log
		○ Any glue code needed to load/save these relationships.
	6. At the end, include:
		○ A brief description of the new relationships (which tables link to which).
		○ A short “Open Questions” list if any part of the spec conflicts with existing enums/fields.

If you like, next we can sketch an explicit table-by-table schema (with field names) or a wireframe of the revised intake screen based on what you already have on those screenshots, so Claude has even less room to improvise.

From <https://chatgpt.com/c/6917ed2d-4b2c-832c-b905-26c8290ffa11> 
