// src/lib/types.ts

// This is a generic type for any Next.js page that receives URL parameters.
// We can reuse this across our application.
export type PageProps<T = Record<string, string>> = {
  params: T;
  searchParams: { [key: string]: string | string[] | undefined };
};
