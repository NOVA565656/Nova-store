function isSafeUrl(urlStr: string): boolean {
  try {
    const parsed = new URL(urlStr);
    if (parsed.protocol !== 'https:') return false;
    
    const hostname = parsed.hostname.toLowerCase();
    
    // Block localhost variations
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]' || hostname === '::1') return false;
    
    // Block AWS/GCP metadata IP
    if (hostname === '169.254.169.254') return false;

    // Block IPv4 private ranges
    if (hostname.startsWith('10.') || hostname.startsWith('192.168.')) return false;
    if (hostname.startsWith('172.')) {
      const parts = hostname.split('.');
      if (parts.length > 1) {
        const second = parseInt(parts[1], 10);
        if (second >= 16 && second <= 31) return false;
      }
    }
    
    return true;
  } catch {
    return false;
  }
}

export async function verifyPlatformProof(
  platform: string,
  proofUrl: string,
  expectedKey: string
): Promise<{ success: boolean; message: string }> {
  try {
    if (!isSafeUrl(proofUrl)) {
      return { success: false, message: 'Invalid or unsafe URL provided' };
    }

    if (platform === 'website') {
      const res = await fetch(proofUrl, { method: 'HEAD', redirect: 'follow' });
      return { success: res.ok, message: res.ok ? 'Website reachable' : 'Website returned error' };
    }

    if (platform === 'github') {
      const match = proofUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
      if (!match) return { success: false, message: 'Invalid GitHub URL format' };
      
      const [, owner, repo] = match;
      const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/verify.txt`;
      const res = await fetch(apiUrl, {
        headers: process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}
      });

      if (!res.ok) return { success: false, message: 'verify.txt not found in repo root' };
      
      const data = await res.json();
      const content = Buffer.from(data.content, 'base64').toString('utf-8').trim();
      
      return { 
        success: content.includes(expectedKey), 
        message: content.includes(expectedKey) ? 'Key found' : 'Key not found in verify.txt' 
      };
    }

    if (platform === 'tiktok' || platform === 'facebook') {
      return { success: true, message: 'Key accepted (Mocked)' };
    }

    return { success: false, message: 'Unsupported platform' };
  } catch (e) {
    return { success: false, message: 'Verification failed due to network error' };
  }
}