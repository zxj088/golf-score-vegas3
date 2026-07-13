const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS'
};

Deno.serve(async request => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (request.method !== 'GET') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  const apiKey = Deno.env.get('GOLF_COURSE_API_KEY') || '';
  if (!apiKey) {
    return new Response('GolfCourseAPI key is not configured', { status: 500, headers: corsHeaders });
  }

  const sourceUrl = new URL(request.url);
  const path = sourceUrl.searchParams.get('path') || '';
  if (!/^\/(search|courses\/[\w-]+)$/.test(path)) {
    return new Response('Unsupported GolfCourseAPI path', { status: 400, headers: corsHeaders });
  }

  sourceUrl.searchParams.delete('path');
  const target = new URL(`https://api.golfcourseapi.com/v1${path}`);
  sourceUrl.searchParams.forEach((value, key) => target.searchParams.set(key, value));

  const upstream = await fetch(target, {
    headers: {
      Authorization: `Key ${apiKey}`
    }
  });

  const body = await upstream.text();
  return new Response(body, {
    status: upstream.status,
    headers: {
      ...corsHeaders,
      'Content-Type': upstream.headers.get('Content-Type') || 'application/json'
    }
  });
});
