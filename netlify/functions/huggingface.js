exports.handler = async function (event) {
  try {
    const urls = [
      'https://huggingface.co/api/models?sort=downloads&limit=20&direction=-1&filter=text-generation',
      'https://huggingface.co/api/models?sort=downloads&limit=10&direction=-1',
    ];

    const results = await Promise.allSettled(
      urls.map(url =>
        fetch(url, {
          headers: {
            Accept: 'application/json',
            'User-Agent': 'OSS-AI-Pulse/1.0',
          },
        }).then(r => {
          if (!r.ok) throw new Error(`HF ${r.status}`);
          return r.json();
        })
      )
    );

    const seen = new Set();
    const models = [];
    for (const result of results) {
      if (result.status !== 'fulfilled') continue;
      for (const m of result.value) {
        const id = m.id || m.modelId || '';
        if (!seen.has(id) && models.length < 20) {
          seen.add(id);
          models.push(m);
        }
      }
    }

    if (!models.length) {
      return { statusCode: 502, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'No models returned from HF API' }) };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'public, max-age=300' },
      body: JSON.stringify(models),
    };
  } catch (err) {
    return { statusCode: 500, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: err.message }) };
  }
};
