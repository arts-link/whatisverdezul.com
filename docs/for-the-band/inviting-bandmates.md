# Giving a Bandmate Access to Edit the Website

No technical background needed.

---

## How this works, in plain terms

Anyone who edits the Verdèzul site does it through the site's built-in editor at **whatisverdezul.com/admin** — no code, just forms for your shows, releases, and merch.

To keep things safe, the editor doesn't have its own password. Instead, each person logs in with **their own free GitHub account**. GitHub is the service that quietly stores the website's files behind the scenes. So giving a bandmate access is a two-part thing:

1. **You add their GitHub account to the band's editor list** (one time, ~5 minutes).
2. **They log in** with that account and start editing.

Everyone uses their **own** account — never share one login. That way every change is tied to the person who made it, and you can add or remove people anytime.

---

## What each bandmate needs first

- A **free GitHub account**. If they don't have one, they sign up at **github.com** (free — no paid plan, ever, for this).
- That's it. No apps to install, nothing to pay.

Have them send you the **username** they picked (or the email they signed up with) — you'll need it in the next step.

---

## Part 1 — Add a bandmate as an editor *(you do this once per person)*

You'll need access to the band's GitHub organization (called **arts-link**). If you don't have that access yet, email Ben and he'll either add the person for you or give you the keys.

**The first time only — make the "Band" team:**
1. Go to **github.com/orgs/arts-link/teams** and click **New team**.
2. Name it **Band**, leave it set to **Visible**, and click **Create team**.
3. On the team page, open the **Repositories** tab → **Add repository** → search for **whatisverdezul.com** → set the permission to **Write** → **Add**.
   - "Write" is the setting that lets the team save edits. This is the important one.

**Every time you add a person (including the first):**
4. On the **Band** team page, click **Add a member**.
5. Type their GitHub **username** (or email) and send the invite.
6. Tell them to check their email and **accept** the invitation — they can't log in until they do.

That's the whole setup. Once someone's on the Band team, they're an editor.

---

## Part 2 — First login *(send these steps to the new bandmate)*

1. Accept the GitHub invitation email first (look for one from GitHub).
2. Go to **whatisverdezul.com/admin** (that's the site address followed by `/admin`).
3. Click **Login with GitHub** and, if asked, click **Authorize**.
4. You're in — you'll see the editor with Shows, Releases, and the rest. Make a change and hit **Publish** to save it to the live site.

If the login window says something about access being denied, it usually means the invitation hasn't been accepted yet — check that email and try again.

---

## Removing someone later

If a bandmate leaves or you just want to pull their access:

1. Go to the **Band** team page at github.com/orgs/arts-link/teams.
2. Find their name and **remove** them from the team.

Their access to the editor stops right away. Nothing else changes.

---

## Good to know

- **It's all free.** Free GitHub accounts, free organization, unlimited people. Editing the site never requires a paid plan.
- **Own account each.** Don't share one login — give everyone their own. It's safer and lets you add/remove people cleanly.
- **What editors can change.** Everyone on the Band team can edit any of the site's content (shows, releases, merch, page text). There's no "only shows" vs "only merch" level — it's all-or-nothing, so only add people you'd trust with the whole site.
- **You can't break the design.** The editor only changes content, not the look or layout of the site.

---

## Bottom line

- **To add a bandmate:** get their GitHub username → add them to the **Band** team → they accept the email → they log in at whatisverdezul.com/admin.
- **First time only:** create the Band team and give it **Write** access to the repo.
- **Everyone uses their own free account.** No cost, and you can remove anyone in two clicks.

Questions? Reach out to ben@benstrawbridge.com.
