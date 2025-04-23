import { NextRequest, NextResponse } from 'next/server';
import { withORMContext } from '@/db/orm';
import { RequestHistory } from '@/db/entities/RequestHistory';

export async function POST(req: NextRequest) {
  const { url, method, headers, body } = await req.json();
  let responseData = '';
  let status = 0;
  
  try {
    // Prepare the request body properly
    let requestBody = undefined;
    if (!['GET', 'HEAD'].includes(method) && body) {
      // Check if body is a JSON string and set the appropriate content type
      try {
        // If body is already an object, stringify it
        if (typeof body === 'object') {
          requestBody = JSON.stringify(body);
        } else {
          // If body is a string that represents JSON, use it directly
          JSON.parse(body); // Just to validate it's proper JSON
          requestBody = body;
        }
        
        // If Content-Type is not set and we're sending JSON, set it
        if (requestBody && !headers['Content-Type'] && !headers['content-type']) {
          headers['Content-Type'] = 'application/json';
        }
      } catch (e) {
        // If not valid JSON, use the body as is (could be form data, text, etc.)
        requestBody = body;
      }
    }

    const fetchOptions = {
      method,
      headers,
      body: requestBody,
    };

    console.log('Sending request:', { url, method, headers, body: requestBody });
    
    const fetchRes = await fetch(url, fetchOptions);
    status = fetchRes.status;
    
    // Try to parse as JSON first, fallback to text
    try {
      const contentType = fetchRes.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        responseData = await fetchRes.json();
        responseData = JSON.stringify(responseData, null, 2);
      } else {
        responseData = await fetchRes.text();
      }
    } catch (e) {
      responseData = await fetchRes.text();
    }
  } catch (e: any) {
    console.error('Fetch error:', e);
    responseData = e.message || 'Request failed';
    status = 0;
  }

  await withORMContext(async (orm) => {
    const repo = orm.em.getRepository(RequestHistory);
    const entry = repo.create({
      url,
      method,
      headers: JSON.stringify(headers),
      body,
      response: responseData,
      status,
      createdAt: new Date(),
    });
    orm.em.persist(entry);
    await orm.em.flush();
  });

  return NextResponse.json({ status, response: responseData });
}
