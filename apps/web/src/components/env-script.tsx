export function EnvScript() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:4000';
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `window.__ENV=${JSON.stringify({ NEXT_PUBLIC_API_URL: apiUrl })}`,
      }}
    />
  );
}
