exports.handler = async function (event) {
  const key = process.env.PH_TOKEN;
  if (!key) {
    return { statusCode: 503, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'PH_TOKEN not configured' }) };
  }

  // Fetch recent posts sorted by newest, no topic filter
  const query = `{
    posts(order: NEWEST, first: 20) {
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

    if (data.errors || !data?.data?.posts?.edges?.length) {
      // Fallback: top voted AI posts
      const fallback = `{
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
        body: JSON.stringify({ query: fallback }),
      });
      const data2 = await r2.json();
      return { statusCode: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify(data2) };
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
