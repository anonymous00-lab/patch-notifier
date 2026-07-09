import { cookies } from 'next/headers';
import * as db from '@/lib/db';

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('session_id')?.value;
  
  if (!sessionId) {
    return null;
  }
  
  const session = db.getSession(sessionId);
  if (!session) {
    return null;
  }
  
  return {
    id: session.uid,
    email: session.email,
    username: session.username,
    avatar_url: session.avatar_url,
  };
}
