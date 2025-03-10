import { NextResponse } from 'next/server';

const API_URL = 'https://yuanqi.tencent.com/openapi/v1/agent/chat/completions';
const API_KEY = process.env.YUANQI_API_KEY || 'tZr40H0gLkvPzeMSAJ1mPNAdkvdx3DX0';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'X-Source': 'openapi',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        assistant_id: 'A8zwNhwzIcKk',
        user_id: body.user_id || '001',
        stream: false,
        messages: body.messages || [],
      }),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
} 