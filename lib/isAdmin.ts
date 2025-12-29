import { cookies } from 'next/headers';

export async function isAdmin() {
  const token = (await cookies()).get("token");
  const secret = token?.value;
  return secret === process.env.ADMIN_TOKEN;
}
