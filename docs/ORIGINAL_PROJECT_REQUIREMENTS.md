# Project Proposal

Website/Web App Updates

<aside>
👉

**Summary
The current website (**[https://servicedogstandards.org](https://servicedogstandards.org/)**) requires UX design improvements and Admin features and is to be rebuilt in Vue.js.**

</aside>

**Prepared by Rob Dell'Aquila
rob@thumpwerks.com**
847-309-4658

### Documents

---

[Pre Planning](https://www.notion.so/Pre-Planning-f264b3a43c0b432994fcc1dcfe7390fb?pvs=21)

### Project Team

---

👨🏻‍💼 **Project Manager:** Marc Battaglia

👨🏼‍💻 **Tech Lead:** NAME

👨🏻‍💻 **Designer: Rob Dell'Aquila**

### 🤝 Problem Statement

---

Our website currently has a suboptimal user experience and lacks accessibility features, causing frustration for many users. Additionally, our Admin screens are difficult to navigate and lack the necessary features that make it easy for users to find, add, and edit data. In order to improve the overall user experience, we need to prioritize the addition of UX and A11Y (Accessibility) features, as well as improve the usability and functionality of our Admin screens. To help achieve this, we will design an Admin Dashboard that enables administrators to manage users and orders, view reports, and gain insights into various data points through the use of data visualization.

### 📈 Success Metrics

---

1. User Satisfaction (Net Promoter Score - NPS): Measure the likelihood of users recommending the web app to others. Ask users, "How likely are you to recommend this web app to a friend or colleague?" Calculate the NPS by subtracting the percentage of detractors from the percentage of promoters. Compare the NPS before and after the redesign to assess the impact on user satisfaction.
2. Task Completion Rate: Measure the percentage of users successfully completing specific tasks in the web app. This indicates the ease of use and effectiveness of the redesigned interface. Track task completion rates to identify usability issues or bottlenecks. Compare the rates before and after the redesign to evaluate the improvements made.

## 👨🏻‍🎨 UI/UX Design

### 💁🏻‍♂️ In Scope

---

- Redesign the Onboarding flow
- Provide an option for the mega menu
- Provide an option for the Mobile menu
- Add A11Y (Accessibility) features
- Design an Admin Dashboard
- Redesign the Admin screens

### 🙅🏻‍♂️ Out of Scope

---

- Add features and  more functionality to Admin screens
- Provide PHP/HTML/CSS markup for Dev handoff
- Update the current look and feel of the site

### 🤦🏻 Risks

---

1. Disruption to User Familiarity: There is a risk of confusing existing users if the changes in UX and A11Y significantly alter the familiar design and user experience.
2. Introduction of New Usability Issues: There is a risk of unintentionally creating new usability or accessibility problems while making improvements to the web app, despite thorough testing and research.

By addressing these risks through careful planning, user involvement, and comprehensive testing, we can minimize any negative impact on users during the update process.

---

## 👨🏻‍💻 Development

### 💁🏻‍♂️ In Scope

---

- Rebuild the Onboarding flow
- Rebuild the mega menu
- Rebuild the Mobile menu
- Add A11Y (Accessibility) features
- Build an Admin Dashboard

- Rebuild the Admin screens
- Add features and  more functionality to Admin screens
- Restyle existing pages based on new UI specs

[Project Cost](https://www.notion.so/6df65715dc3f402fbb05c7c35c4ab98a?pvs=21)

![](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/22013216-b92f-40a9-94d2-68f80d62f4c2/Rectangle_161.png)

## Payment Instructions

1. 50% Advance and 50% after work is done.
2. PayPal address: [paypal.me/rdellaquila](paypal.me/rdellaquila)
3. Venmo Details : [venmo.com/u/rdellaquila](https://www.venmo.com/u/rdellaquila) Website/Web App requirements

**Prepared by Rob Dell'Aquila
rob@thumpwerks.com**
847-309-4658

### Project Team

---

👨🏻‍💼 **Project Manager:** Marc Battaglia

👨🏻‍💻 **Designer:** Rob Dell'Aquila

👨‍💻 **Developer:** Buford Eeds

**Red text indicates an item that is out of scope or not previously discussed*

## 👨🏻‍🎨 Website Redesign

- Ensure the website is mobile-friendly and optimized for easy use on mobile devices.
- We like Stripe and Squarespace for their usability and UX.
- *Ensure the website can accept foreign accent marks over letters for international users.*
- Expand on provided images and graphic vocabulary as needed.
- Review the website for usability and identify and fix any bugs.
- *Design the website in a way that allows easy duplication and launching under different brands to serve diverse audiences (e.g., ESA Standards).*
- *On the home page, we would like an animated iPhone screen like on Stripe to illustrate visually how some things work, for example, scrolling down on a handler's Public Access page or Trainer Page.*

## 📈 Dashboard

- Design a simple and visually appealing dashboard for users, focusing on mobile accessibility.
- Design a dashboard with rounded corner "pods" or "cards"
- Implement two admin user access levels. One that has total access and a second that allows processing orders, shipping, and membership records but not payment accounts.
- The first pod is for the SDS Agreement, which must be accepted every four years by handlers and can be redone at any time. After agreement is accepted it turns into a countdown timer.
- Second pod has a circular Account Completion gauge.
- Create a third pod showing a list of registered dogs, including handler name, dog's name, dog photo, and an active status indicator (e.g., colored dot or button). Use different colors (red, yellow, green) to represent the status and provide explanations for yellow or red buttons. Determine the best communication method with users (on-site messaging or emails). Need help with this.
- Clicking on a team in the third pod should allow users to order/reorder materials, edit registration and photo, choose displayed documents/achievements, and view their public page.
- Enable visibility of active and inactive dogs in the third pod, categorizing inactivity as washout, retirement, or "in memoriam." Allow the option to hide inactive dogs from users but keep them visible for administrative purposes.

## 📋 Forms/Database

- Simplify the onboarding process, shopping cart process, order processing process, etc. The SDS Training and Behavior Standards Agreement is lengthy, but everything else should be easy.
- Ensure easy access to user-entered data, considering options like PHPMyAdmin or prebuilt solutions.
- Provide visibility of unprocessed orders and a history of processed orders.
- *Enable users to complete registration portions at a later time with ease.*
- *Implement an Account Completion function that encourages users to complete agreement sections gradually and makes it fun.*
- Collect verified email as the initial data for a handler, followed by registration for self or someone else (with a dropdown for the latter) and disabled handler name and dog's name.
- *Include a standard animated green checkmark to indicate successful completion of any process (order completion, user agreement acceptance, etc).*
- *We also have an HTML5 animated dog that we use after someone makes a donation. Should he be anywhere else?*
- *Set up automatic email reminders six months before the agreement expiration date.*
- Define product options (physical and digital kits, patches, etc.) and ensure an easy way to obtain and print the necessary information. Simplify the current manual process.
- *Digital kit has a PDF certificate, would be nice if it had a QR code which goes directly to their online registration. It also has a Google/Apple wallet card in PassKit. These things need to be easy to download immediately. Do they go into the third pod with the teams?*
- *Always redirect users to the shopping cart upon completion of the SDS Training and Behavior Standards Agreement.*

## 🛒 Store

- *Create a printable orders list with ship-to name, ordered items, and customized materials information.*
- Implement standard shopping cart features such as order tracking, order history, and abandoned cart emails.

---