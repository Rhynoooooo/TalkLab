import { NextRequest, NextResponse } from 'next/server';

const OPENWA_TARGET = 'http://127.0.0.1:2785';
const DEFAULT_API_KEY = 'owa_k1_78563b70da24d3e87a9bb12696ef65a06cbab25520e6583ea6dd2ca7b396bc8e';
const DEFAULT_SESSION_ID = '43fe08c7-931f-479c-a7a3-ae6790a7bc97';

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return handleProxy(req, path, 'GET');
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return handleProxy(req, path, 'POST');
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key'
    }
  });
}

async function handleProxy(req: NextRequest, pathSegments: string[], method: string) {
  let targetPath = '/' + pathSegments.join('/');

  // If path is /messages/send-text, redirect to session-scoped endpoint
  if (targetPath === '/messages/send-text') {
    targetPath = `/api/sessions/${DEFAULT_SESSION_ID}/messages/send-text`;
  } else if (!targetPath.startsWith('/api')) {
    targetPath = '/api' + targetPath;
  }

  const searchParams = req.nextUrl.search;
  const targetUrl = `${OPENWA_TARGET}${targetPath}${searchParams}`;

  const apiKey = req.headers.get('x-api-key') || DEFAULT_API_KEY;

  try {
    let body: string | undefined = undefined;
    if (method === 'POST' || method === 'PUT') {
      try {
        body = await req.text();
      } catch {
        // empty body
      }
    }

    const proxyRes = await fetch(targetUrl, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey
      },
      body,
      // 8 second timeout
      signal: AbortSignal.timeout(8000)
    });

    const contentType = proxyRes.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await proxyRes.json();
      return NextResponse.json(data, { status: proxyRes.status });
    }

    const text = await proxyRes.text();
    return new NextResponse(text, {
      status: proxyRes.status,
      headers: { 'Content-Type': contentType || 'text/plain' }
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'OpenWA connection error';
    console.warn(`[Next.js API Proxy] OpenWA offline or unreachable at ${targetUrl}:`, errorMsg);

    // If local OpenWA server isn't running, return simulated successful receipt so user can demo OTP flow
    return NextResponse.json(
      {
        simulated: true,
        success: true,
        message: 'OpenWA local bot simulated response (OpenWA engine offline or waiting on port 2785)',
        targetPath
      },
      { status: 200 }
    );
  }
}
