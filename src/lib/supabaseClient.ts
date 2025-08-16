// src/lib/supabaseClient.ts
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs'
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs'
import type { GetServerSidePropsContext, NextApiRequest, NextApiResponse } from 'next'

// Client-side client
export const createClient = () => createPagesBrowserClient()

// Server-side client (for Server Components, API routes)
export const createServerClient = (
  context: GetServerSidePropsContext | { req: NextApiRequest; res: NextApiResponse }
) => createPagesServerClient(context)