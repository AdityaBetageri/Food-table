require('dotenv').config();
const apiKey = process.env.FIREBASE_API_KEY;
const email = 'test@example.com';

async function testReset() {
  try {
    const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requestType: 'PASSWORD_RESET',
        email: email,
      }),
    });
    const data = await response.json();
    if (response.ok) {
      console.log('SUCCESS:', data);
    } else {
      console.error('ERROR:', data);
    }
  } catch (err) {
    console.error('FETCH ERROR:', err.message);
  }
}

testReset();
