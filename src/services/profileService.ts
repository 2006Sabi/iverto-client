export async function getProfile() {
  const token = localStorage.getItem('token');
  const res = await fetch('https://iverto.onrender.com/api/auth/profile', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch profile');
  const data = await res.json();
  return data.data;
}
