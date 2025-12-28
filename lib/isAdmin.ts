import { cookies } from 'next/headers';

export async function isAdmin() {
  const secret = (await cookies()).get("token").value;
  return secret === process.env.ADMIN_TOKEN;
}
