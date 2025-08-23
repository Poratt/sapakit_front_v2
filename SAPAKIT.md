Project Context Transfer: "Sapakit" - Intelligent Supply Chain Management System
Objective: This chat will continue the development of a full-stack project named "Sapakit". The following is a comprehensive summary of the project's current state, architecture, and key decisions made so far. Please absorb this context fully to provide accurate and relevant assistance.
1. Project Overview & Vision
"Sapakit" is a sophisticated, end-to-end B2B platform for managing supply chains and orders. It has evolved from a simple CRUD application into a strategic operational intelligence tool.
Core Value Proposition: Transform chaotic manual ordering processes into a streamlined, intelligent, and proactive workflow. The system not only manages data but analyzes it to provide actionable, AI-driven business insights.
Motto: From Chaos to Clarity.
2. Backend Architecture (NestJS)
Framework: NestJS with TypeScript.
Database: MySQL with TypeORM.
Architecture: Modular, with distinct modules for Users, Suppliers, Products, Categories, Orders, and AI.
Authentication: Robust JWT-based authentication using Passport.js, with access_token and refresh_token stored in HTTP-Only cookies.
API: Clean, RESTful API that returns a standardized ServiceResultContainer object ({ success, message, result }).
Error Handling: A global AllExceptionsFilter catches all errors and formats them into a consistent JSON response, keeping services clean of try...catch blocks.
AI Integration:
Utilizes Google Gemini (via @google/generative-ai SDK).
Features an InsightsService that runs a daily cron job (@nestjs/schedule).
This service performs complex data analysis on the database (costs, product trends, supplier spending) and uses a sophisticated prompt to generate strategic insights in a structured JSON format.
Insights are saved to a dedicated insights table in the database.
3. Frontend Architecture (Angular 17+)
Framework: Angular (latest), fully standalone components.
State Management: NgRx Signal Store. We have dedicated stores (AuthStore, SupplierStore, UserStore, OrderStore, InsightStore) which are the single source of truth. Components are reactive and primarily read data from these stores.
UI & Design:
A powerful combination of PrimeNG for complex components (tables, dialogs, charts) and Tailwind CSS for custom styling.
A comprehensive, custom Design System is in place with CSS variables (_variables.css), resulting in a polished and consistent look and feel.
Routing:
A robust routing structure using canMatch guards to differentiate between a public-facing area (landing page, login) and the authenticated main application, all under the root URL (/).
An APP_INITIALIZER is used to resolve the user's authentication state before the router runs, definitively solving any race conditions on page refresh.
Key Components & Features:
Advanced Calendar: A highly complex, interactive weekly calendar that displays Jewish holidays, daily times (zmanim), and visualizes scheduled orders for all suppliers.
Drag & Drop Management: A sophisticated supplier detail page with full CDK Drag & Drop functionality for reordering products and categories, including optimistic UI updates and batch API calls.
Dynamic Dialogs: Heavy use of PrimeNG's DialogService for all CRUD operations, creating a fluid user experience.
AI-Powered Features (WIP): A component for an AI Code Generator and a VoiceListenerComponent.
Current Status & Next Steps:
The core application is stable and architecturally sound. We have successfully implemented the backend AI insight generation and the frontend UI for displaying these insights in the header. We have also resolved complex race conditions related to routing and state initialization.
We are now ready to continue building new features or refining existing ones. I am the developer. You are my AI assistant. Let's continue.



 Get-ChildItem -Path "src" -Recurse -Include *.ts, *.html, *.css -Exclude *.spec.ts | ForEach-Object { 
>>   "--- START OF FILE " + $_.FullName + " ---";
>>   Get-Content -Path $_.FullName -Raw;
>>   "`n--- END OF FILE ---`n"
>> } | Out-File -FilePath "project_context.txt" -Encoding utf8