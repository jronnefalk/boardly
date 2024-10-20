# Boardly - A Collaborative Board Application

## Project Overview

**Boardly** is a web-based, real-time collaborative project management tool designed for task management and teamwork. Inspired by platforms like Trello and Jira, Boardly allows users to create boards, manage tasks, and collaborate with team members in real-time.

## Core Features

- **User Authentication**: Secure login and registration through Kinde.
- **Board Management**: Users can create, view, edit, and delete boards to organize their projects and tasks.
- **Task Management**: Within boards, users can add, update, and track tasks.
- **Real-Time Collaboration**: All updates to boards and tasks are reflected in real-time for all collaborators.
- **Invitations**: Board creators can invite others to join and collaborate on their board.
- **Real-Time Notifications**: Immediate updates on task changes to keep everyone informed.
  
## Technical Specifications

### Frontend

- **Framework**: Next.js
- **Language**: TypeScript
- **Styling**: Tailwind CSS for a responsive and clean user interface.
- **Real-Time Updates**: Implemented using Socket.IO to keep board activities in sync across users.

### Backend

- **Server**: Node.js with Express.js.
- **Database**: Prisma with MongoDB.
- **Real-Time Communication**: WebSockets via Socket.IO for real-time collaboration.
- **Authentication**: Kinde for secure user authentication and session management.

## Getting Started

First, clone the repository and navigate to the project directory. Then, install the dependencies:

```bash
npm install
```
Run the development server:
```bash
npm run dev
```
Open http://localhost:3000 to see the project running locally. 


