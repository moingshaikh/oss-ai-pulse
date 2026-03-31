exports.handler = async function (event) {
  try {
    const query = 'cat:cs.AI+OR+cat:cs.LG+OR+cat:cs.CL';
    const url = `https://export.arxiv.org/api/query?search_query=${query}&sortBy=submittedDate&sortOrder=descending&max_results=15`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 9000);

    let r;
    try {
      r = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/xml, text/xml, */*',
          'User-Agent': 'OSS-AI-Pulse/1.0',
        },
      });
    } finally {
      clearTimeout(timeout);
    }

    if (!r.ok) {
      return { statusCode: r.status, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: `arxiv ${r.status}` }) };
    }

    const xml = await r.text();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=300',
      },
      body: xml,
    };
  } catch (err) {
    const msg = err.name === 'AbortError' ? 'arxiv request timed out (9s)' : err.message;
    return { statusCode: 500, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: msg }) };
  }
};
