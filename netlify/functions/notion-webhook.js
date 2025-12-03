/**
 * Netlify Function: Notion Webhook Handler
 * 
 * This function receives webhooks from Notion and triggers 
 * a GitHub Action to sync the database.
 * 
 * Notion sends webhooks to: https://your-site.netlify.app/.netlify/functions/notion-webhook
 */

export default async (req) => {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const GITHUB_TOKEN = process.env.GITHUB_PAT;
  const GITHUB_REPO = process.env.GITHUB_REPO; // format: "owner/repo"

  if (!GITHUB_TOKEN || !GITHUB_REPO) {
    console.error('Missing GITHUB_PAT or GITHUB_REPO environment variables');
    return new Response('Server configuration error', { status: 500 });
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
      return new Response(JSON.stringify({ success: true, message: 'Sync triggered' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      const errorText = await response.text();
      console.error('GitHub API error:', response.status, errorText);
      return new Response(JSON.stringify({ error: 'Failed to trigger sync' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Error triggering GitHub Action:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const config = {
  path: "/.netlify/functions/notion-webhook"
};

