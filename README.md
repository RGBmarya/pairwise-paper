# Quanta Paper Rankings

A web application that lets users compare and rank machine learning papers using the ELO rating system. Papers are fetched from ArXiv's API and users can vote on which papers they find more interesting or impactful.

## Features

- Fetches recent machine learning papers from ArXiv
- Uses ELO rating system for paper rankings
- Beautiful UI with Computer Modern fonts
- Real-time updates of paper rankings
- Full paper abstracts and metadata

## Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- Prisma (SQLite)
- ArXiv API

## Local Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up the database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

## Deployment

### Deploy on Vercel (Recommended)

The easiest way to deploy this application is using Vercel:

1. Push your code to a GitHub repository
2. Go to [Vercel](https://vercel.com)
3. Create a new project and import your repository
4. Vercel will automatically detect Next.js and set up the build configuration
5. Deploy!

Note: The application uses SQLite, which means the database will be reset on each deployment. For production, consider switching to a persistent database like PostgreSQL.

### Alternative Deployment

For other platforms:

1. Build the application:
   ```bash
   npm run build
   ```
2. Start the production server:
   ```bash
   npm start
   ```

## Environment Variables

Create a `.env` file with the following variables:
```
DATABASE_URL="file:./dev.db"
```

## License

MIT
