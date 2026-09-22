async function test() {
  const res = await fetch('http://localhost:3000/api/send-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'bloomlylove21@gmail.com',
      slug: 'test-slug',
      senderName: 'Ton',
      recipientName: 'Friend'
    })
  });

  const data = await res.json();
  console.log('STATUS:', res.status);
  console.log('RESPONSE:', data);
}

test();
