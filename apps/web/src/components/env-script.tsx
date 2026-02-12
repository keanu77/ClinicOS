import { headers } from 'next/headers';

export async function EnvScript() {
  // Force dynamic rendering so process.env is read at request time, not build time
  await headers();
  const apiUrl = process.env['API_URL'] || 'http://localhost:4000';
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `window.__ENV=${JSON.stringify({ NEXT_PUBLIC_API_URL: apiUrl })}`,
      }}
    />
  );
}
