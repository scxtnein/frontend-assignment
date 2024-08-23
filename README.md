# Client Management System

## Core steps

1. Clone the repo
2. Check the requirements list
3. Once all the tasks are completed, please create a PR
4. Inform the Virtusize team about the PR

## Task Description

The CMS tool is a client management system that allows the Admin to easily create, manage, and remove new clients/users.

For fast prototyping we are using `json-server` use `npm run api` to start the server.
JSON-Server [documentation](https://github.com/typicode/json-server)

We expect the assignment to be completed within 4 to 5 hours.
If its taking more time than expected, do let us know in the `devNotes.md`

## Before you start

Read through the task list and work on each task in the given sequence.

Update the `devNotes.md` file where required, this is meant for leaving comments for the reviewers.

## Admin/Design Requirements

- **Login**: Before the user can access the data, they need to login into the application for security.

- **Client Information**: The CMS tool provides a flexible and hierarchical structure for organizing client data. The admin team has requested that the data should be displayed as a table.The table should display only the clients `name, company, subscriptionCost+currecy, age`.

- **Adding new clients**: The Client Management tool supports customizable workflows, allowing the admin to add new clients and update any of the client properties other than `registered` date.

- **Update current design**: The design team feels that the number of clients can get huge and has requested to only display 10 clients at a time.

- **Removing Client data**: The admin wants the ability to remove clients once the contract is over or ther are any delayed payments.

- **View all client details**: The admin team has requested to be to see all the data for a given client when selected. As some of the admin team members are currently working remotely, the design needs to support date formatting as per the region, and should only show the date not time.
