# 🛒 Sapakit - Order Management System (Angular 19)

Sapakit is a smart B2B order management system designed to streamline and simplify the process of ordering from suppliers. The project provides a central dashboard, an interactive calendar for scheduling orders, and advanced tools for managing suppliers, products, and order history. The entire system is built with a modern, reactive approach using Angular Signals.

---

### ✨ Key Features

*   📊 **Interactive Dashboard:** Get a quick overview of key metrics, including daily orders, open drafts, and monthly cost analysis with a comparison to the previous month.
*   📅 **Advanced Calendar:** Visually track and manage scheduled orders. View statuses (Draft, Sent, Due Today) and create new orders directly from the calendar interface.
*   📦 **Hierarchical Management:** Full CRUD (Create, Read, Update, Delete) functionality for suppliers, categories, and products.
*   ✨ **Drag & Drop Interface:** Intuitively arrange products within categories and reorder the categories themselves to customize your workflow.
*   📈 **Order History & Analytics:** Review past orders in a detailed table or through dynamic graphs (powered by Chart.js) to visualize trends and patterns.
*   🤖 **AI-Powered Insights:** Generate business insights on ordering patterns, popular products, and costs per supplier.
*   📲 **WhatsApp Integration:** Send formatted order lists directly to suppliers via WhatsApp with a single click.
*   ⚙️ **Advanced Admin Panel:** A dedicated area for System Administrators to manage user accounts, permissions, and subscription plans (tiers).
*   ↔️ **Data Import & Export:** Easily import product lists from Excel files and export supplier lists or order histories.

### 🛠️ Tech Stack

*   **Framework:** Angular 19+ (Standalone Components, Signals Architecture)
*   **State Management:** NgRx Signals (`signalStore`) for reactive and performant state management.
*   **UI Components:** A hybrid approach combining **PrimeNG** (Tables, Dialogs, Buttons) and **Angular Material** (Tabs, Form Controls).
*   **Styling:** Tailwind CSS for rapid UI development, alongside custom SCSS and PrimeNG Themes.
*   **Charts:** Chart.js for data visualization in the order history section.
*   **Backend:** The project interfaces with a dedicated API (not included in this repository).
*   **Calendar Logic:** Utilizes the Hebcal API for Hebrew calendar data and daily times (Zmanim).

### 📸 Screenshots

| Main Dashboard | Supplier Product Management | History DB
| :---: | :---: | :---: |
| <img width="542" height="566" alt="image" src="https://github.com/user-attachments/assets/0e80b167-604c-4683-a96e-78e1fb865b05" /> | <img width="733" height="569" alt="image" src="https://github.com/user-attachments/assets/10c1289e-83e5-492b-91c6-2a537374589f" /> | <img width="737" height="573" alt="image" src="https://github.com/user-attachments/assets/7cca0916-b740-424c-8c60-364b9f5aa3ca" /> |

### 🚀 Getting Started

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-username/sapakit.git
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Run the development server:
    ```bash
    ng serve
    ```

4.  Open your browser to `http://localhost:4200`.

    > **Note:** This project requires its corresponding backend API to be running.

### 🙌 Acknowledgements

*   Developed by **Porat Amrami**
*   Contact: `porat.amrami@gmail.com`
*   Hebrew calendar data powered by [Hebcal.com](https://www.hebcal.com/).
*   Built with the excellent component libraries from [PrimeNG](https://primeng.org/) and [Angular Material](https://material.angular.io/).
