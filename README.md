# MTA-STS Cloudflare Worker

The following [Cloudflare Worker](https://developers.cloudflare.com/workers/) aims to further secure email by implementing MTA-STS across all MX records on a domain. The worker is reusable across all domains concurrently with minimal hits. In production (a 150 person org), I see approximately 600-800 requests per day, well below the limit of 100,000 requests per day.

See something not quite right? Let me know!
