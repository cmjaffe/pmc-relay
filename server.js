const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json({ limit: '2mb' }));

// Allow requests from your Wix site and any iframe embed
app.use(cors({
  origin: '*', // You can restrict this to your Wix domain later, e.g. 'https://www.positivemoneyclub.com'
  methods: ['POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

// Health check — lets Render know the server is running
app.get('/', (req, res) => {
  res.send('Positive Money Fitness Planner relay is running.');
});

// The relay endpoint — receives requests from the planner and forwards to Anthropic
app.post('/api/chat', async (req, res) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured on server.' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();
    res.json(data);

  } catch (err) {
    console.error('Relay error:', err);
    res.status(500).json({ error: 'Something went wrong connecting to the AI.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`PMC relay running on port ${PORT}`);
});
