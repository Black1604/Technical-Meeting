# Flexothene Technical Meetings

A lightweight, responsive meeting scheduling application that integrates with Outlook and follows Flexothene's branding. The system streamlines the meeting booking process while ensuring predefined rules for attendee selection and document uploads.

## Features

- Modern, responsive UI with light/dark mode support
- Outlook calendar integration
- Predefined attendee groups
- Document upload support
- Meeting management (create, view, edit, delete)
- Branding consistency with Flexothene's style guide

## Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- React Hook Form
- Zod for form validation
- date-fns for date formatting
- Microsoft Graph API (for Outlook integration)

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm 9.x or later
- Microsoft 365 account for Outlook integration

### Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd technical-meetings
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory and add your environment variables:
```env
NEXT_PUBLIC_MICROSOFT_CLIENT_ID=your_client_id
NEXT_PUBLIC_MICROSOFT_TENANT_ID=your_tenant_id
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Project Structure

```
technical-meetings/
├── src/
│   ├── app/                 # Next.js app directory
│   │   ├── (auth)/         # Authentication routes
│   │   ├── meetings/       # Meeting management routes
│   │   └── api/           # API routes
│   ├── components/         # Reusable components
│   ├── config/            # Configuration files
│   ├── lib/              # Utility functions and services
│   └── types/            # TypeScript type definitions
├── public/               # Static assets
└── README.md            # Project documentation
```

## Development Decisions

1. **Framework Choice**: Next.js 14 was chosen for its server-side rendering capabilities, file-based routing, and built-in API routes.

2. **TypeScript**: Used throughout the project for type safety and better developer experience.

3. **Styling**: Tailwind CSS for rapid development and consistent design system implementation.

4. **Form Handling**: React Hook Form with Zod for efficient form management and validation.

5. **Date Management**: date-fns for lightweight and efficient date manipulation.

6. **State Management**: React's built-in useState and Context API for simplicity.

## Deployment

The application is designed to be deployed on Vercel for optimal performance and seamless integration with Next.js.

## Contributing

1. Create a feature branch
2. Make your changes
3. Submit a pull request

## License

This project is proprietary and confidential.

## Contact

For any questions or support, please contact the development team.
