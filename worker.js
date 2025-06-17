const mode = 'testing';
// const mode = 'enforce';
const max_age = 604800; // 1 week

addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event.request));
});

const handleRequest = async (request) => {
  const url = new URL(request.url);
  const domain = url.hostname.replace(/^mta-sts\./, '');

  try {
    const mxRecords = await getMxRecords(domain);
    const mxLines = mxRecords.map((record) => `mx: ${record}`);
    const sts = `version: STSv1
mode: ${mode}
${mxLines.join('\n')}
max_age: ${max_age}`;
    return new Response(sts, { status: 200, headers: { 'Content-Type': 'text/plain' } });
  } catch (err) {
    return new Response(`Error: ${err.message}`, { status: 500 });
  }
};

const getMxRecords = async (domain) => {
  const response = await fetch(`https://1.1.1.1/dns-query?name=${domain}&type=MX`, {
    headers: { 'Accept': 'application/dns-json' },
    cf: { timeout: 3000 } // Set a 3-second timeout
  });

  if (!response.ok) {
    throw new Error('Failed to fetch MX records');
  }

  const data = await response.json();
  if (data.Status !== 0 || !data.Answer || !Array.isArray(data.Answer)) {
    throw new Error(`Failed to fetch MX records. Does ${domain} have MX records?`);
  }

  return data.Answer.map((answer) => {
    // Extract the priority and the mail server from the data
    const parts = answer.data.split(' ');
    return parts[1].slice(0, -1); // Remove the trailing dot
  });
};
