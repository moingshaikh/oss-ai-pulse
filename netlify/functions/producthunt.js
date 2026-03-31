exports.handler = async function (event) {
  const key = process.env.PH_TOKEN;
  if (!key) {
    return { statusCode: 503, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'PH_TOKEN not configured' }) };
  }

  // Broader query: no topic filter, just top posts today sorted by votes
  // Also try fetching today's posts specifically
  const query = `{
    posts(order: VOTES, first: 20, postedAfter: "${getDateDaysAgo(30)}") {
      edges {
        node {
          id name tagline votesCount commentsCount url createdAt
          topics { edges { node { name } } }
        }
      }
    }
  }`;

  try {
    const r = await fetch('https://api.producthunt.com/v2/api/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
        'Accept': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    const data = await r.json();

    if (data.errors) {
      // Fallback: simpler query without date filter
      const fallbackQuery = `{
        posts(order: VOTES, topic: "artificial-intelligence", first: 20) {
          edges {
            node {
              id name tagline votesCount commentsCount url createdAt
              topics { edges { node { name } } }
            }
          }
        }
      }`;
      const r2 = await fetch('https://api.producthunt.com/v2/api/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
        body: JSON.stringify({ query: fallbackQuery }),
      });
      const data2 = await r2.json();
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify(data2),
      };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(data),
    };
  } catch (err) {
    return { statusCode: 500, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: err.message }) };
  }
};

function getDateDaysAgo(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}
