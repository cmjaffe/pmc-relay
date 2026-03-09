const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(express.json({ limit: '2mb' }));
app.use(cors());

// Serve the planner HTML at the root URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'planner.html'));
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
  console.log(`PMC Planner running on port ${PORT}`);
});
