/**
 * Netlify Function: Notion Webhook Handler
 * 
 * This function receives webhooks from Notion and triggers 
 * a GitHub Action to sync the database.
 * 
 * URL: https://your-site.netlify.app/.netlify/functions/notion-webhook
 */

exports.handler = async (event, context) => {
  // Only accept POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method not allowed'
    };
  }

  const GITHUB_TOKEN = process.env.GITHUB_PAT;
  const GITHUB_REPO = process.env.GITHUB_REPO; // format: "owner/repo"

  if (!GITHUB_TOKEN || !GITHUB_REPO) {
    console.error('Missing GITHUB_PAT or GITHUB_REPO environment variables');
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server configuration error' })
    };
  }

  try {
    // Trigger the GitHub Action via repository_dispatch
    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/dispatches`,
      {
        method: 'POST',
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_type: 'notion-update',
          client_payload: {
            triggered_at: new Date().toISOString(),
          },
        }),
      }
    );

    if (response.status === 204) {
      console.log('Successfully triggered GitHub Action');
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: true, message: 'Sync triggered' })
      };
    } else {
      const errorText = await response.text();
      console.error('GitHub API error:', response.status, errorText);
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Failed to trigger sync', details: errorText })
      };
    }
  } catch (error) {
    console.error('Error triggering GitHub Action:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
