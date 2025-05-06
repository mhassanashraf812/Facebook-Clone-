import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function VerifyPage() {
  const router = useRouter();
  const { token } = router.query;
  const [message, setMessage] = useState('Verifying...');

  useEffect(() => {
    if (!token) return;

    fetch(`/api/verify?token=${token}`)
      .then((res) => res.json())
      .then((data) => {
        setMessage(data.message);
      })
      .catch(() => {
        setMessage('Something went wrong.');
      });
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <h1>{message}</h1>
    </div>
  );
}
