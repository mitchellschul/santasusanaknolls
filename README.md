# Santa Susana Knolls website

A simple website that can be hosted for free on Netlify. You edit everything
(meetings, board, events, contacts, page text and photos) from easy forms in
Pages CMS. You never have to touch code.

How it works:
- **GitHub** stores the website files (free account).
- **Netlify** puts the website online (free plan).
- **Pages CMS** gives you the edit forms (free). When you click Save, the change
  goes to GitHub and Netlify updates the live site in about a minute.

---

## One-time setup (about 20 minutes)

### 1. Put the files on GitHub
1. Create a free account at **github.com**.
2. Click the **+** at the top right, then **New repository**. Name it
   `knolls-website`, leave it **Public**, and click **Create repository**.
3. On the next page, click **uploading an existing file**.
4. Unzip `knolls-website.zip` on your computer. Open the `knolls-website`
   folder, select **everything inside it**, and drag it all onto the GitHub page.
   Click **Commit changes**.
5. Check that a file named `.pages.yml` is in the list. On a Mac, files that
   start with a dot are hidden and sometimes get left behind. If it's missing:
   click **Add file > Create new file**, type `.pages.yml` as the name, paste in
   everything from `pages-cms-setup.txt`, and click **Commit changes**.

### 2. Put the site online with Netlify
1. Go to **netlify.com** and sign up using **"Sign up with GitHub"**.
2. Click **Add new project > Import an existing project > GitHub**, and choose
   `knolls-website`.
3. Leave the build settings blank and click **Deploy**.
4. Your site is now live at an address like `something.netlify.app`. You can
   rename it under **Project configuration > Change project name**, or connect
   your own domain under **Domain management**.

### 3. Turn on the edit forms (Pages CMS)
1. Go to **app.pagescms.org** and click **Sign in with GitHub**.
2. When asked, install the Pages CMS GitHub app and give it access to
   `knolls-website`.
3. Open `knolls-website`. You'll see the menu: **HOA Meetings, HOA Board,
   Community Events, Community Contacts, Page Text**.

Bookmark **app.pagescms.org**. That's where you'll make every update from now on.

---

## Making updates
1. Go to **app.pagescms.org** and open `knolls-website`.
2. Pick what you want to change from the menu on the left.
3. Make your changes and click **Save**.
4. Wait about a minute, then refresh your website to see it.

- **Board:** fill in names and emails. Positions without a name stay hidden.
  Until you add names, the page shows "will be posted here soon."
- **Events:** add a name, date, time and place. Events disappear from the site
  by themselves after their date. Leave the date empty for ongoing things like
  the Depot museum hours.
- **Meetings:** the dates are worked out by the site (first Tuesday of the
  months you pick), so you only change this if the schedule, time or place changes.
- **Photos:** in Page Text, click a photo field to upload a new picture.
- **Other helpers:** in Pages CMS you can invite other board members by email
  (Collaborators) so they can make updates too, without a GitHub account.

**Tip:** Each Save republishes the site. Netlify's free plan covers roughly 20
republishes a month, which is plenty for normal updates. When you have several
changes, make them in one sitting.
