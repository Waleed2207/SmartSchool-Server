# SmartSpaces
<p align="center">
  <img width="1726" alt="Screenshot 2024-10-16 at 2 29 04" src="https://github.com/user-attachments/assets/3780f53f-898f-44a3-af8e-c96ed5fea874">
</p>

## THE ARCHITECTURE
The architecture of the SmartSpace project It is designed to facilitate SmartSpace automation effectively and efficiently. The architecture is divided into four main layers: Generic Control Manager, Concrete Control Manager, Space Management, and Home State & Action Repository. The idea behind these layers is to separate the abstraction of rules, which are quite general, from the details of implementation in the system. This layered approach ensures a clear separation of responsibilities, making it easy to transfer the system to other spaces because the high-level rules do not depend on specific details of the space.
SmartSpaces is an innovative platform for automatically managing electrical devices in various spaces, such as homes and schools. It creates an environment using predefined rules and schedules, which enhances convenience, power efficiency, safety, and sustainability. Developed in collaboration with the Israeli Electricity Company (IEC) and Ramat Gan Municipality, SmartSpaces ensures compliance with industry standards and is optimized for maximum effectiveness.

## Features

- **Automated Device Management:** Seamlessly control and manage electrical devices in any space based on predefined rules and schedules.
- **Power Efficiency:** Optimize energy usage with intelligent scheduling and automation.
- **Safety and Sustainability:** Enhance safety by automating critical tasks, reducing the risk of electrical hazards, and promoting sustainable energy practices.
- **Scalability:** Designed to scale across various environments, from small homes to large institutions.

## Requirements

To run this project, you need to have the following installed on your system:

- **Node.js** (v14.x or higher)
- **npm** (v6.x or higher)
- **MongoDB** (v4.x or higher)
- **Git** (optional, for cloning the repository)

## Environment Setup
Create a .env file in the root directory of the project and add the following environment variables:

plaintext
Copy code
- PORT=8080
- MONGO_URI= **<your-mongodb-uri>**
- NODE_ENV=development


## Available API Routes
- /api-login: Manage user authentication and login.
- /api-device: Manage electrical devices.
- /api-sensors: Handle sensor data.
- /api-rule: Manage automation rules.
- /api-room: Manage room configurations.
- /api-space: Manage spaces and their configurations.
- /api-suggestion: Get and manage suggestions related to power efficiency and device management.
- /api-mindolife: Interact with external gateways.
- /api-activities: Manage activities within the spaces.
- /api-calendar: Manage and access calendar events.
- /api-endpoint: Manage specific endpoints within the system.


## Installation

### Clone the Repository

If you haven't already, clone the repository to your local machine:

```bash
git clone <repository-url>
cd smart-school-server
npm install
npm start # or npm run dev





