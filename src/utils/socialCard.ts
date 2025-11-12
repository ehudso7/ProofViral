import html2canvas from 'html2canvas';

export interface SocialCardOptions {
  reviewText: string;
  customerName: string;
  rating: number;
  businessName: string;
  logoUrl?: string;
  platform: 'instagram' | 'twitter';
}

export async function generateSocialCard(options: SocialCardOptions): Promise<Blob> {
  const { reviewText, customerName, rating, businessName, logoUrl, platform } = options;

  // Create a temporary container
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.width = platform === 'instagram' ? '1080px' : '1200px';
  container.style.height = platform === 'instagram' ? '1080px' : '675px';

  // Create the card HTML
  container.innerHTML = `
    <div style="
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 60px;
      box-sizing: border-box;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    ">
      ${logoUrl ? `
        <img src="${logoUrl}"
          style="width: 80px; height: 80px; border-radius: 50%; margin-bottom: 30px; object-fit: cover;"
          crossorigin="anonymous" />
      ` : ''}

      <div style="
        color: #FFD700;
        font-size: 48px;
        margin-bottom: 30px;
        letter-spacing: 8px;
      ">
        ${'★'.repeat(rating)}${'☆'.repeat(5 - rating)}
      </div>

      <div style="
        background: rgba(255, 255, 255, 0.95);
        padding: 40px;
        border-radius: 20px;
        max-width: 800px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      ">
        <p style="
          font-size: 28px;
          line-height: 1.6;
          color: #333;
          margin: 0 0 30px 0;
          font-style: italic;
        ">"${reviewText.substring(0, 200)}${reviewText.length > 200 ? '...' : ''}"</p>

        <p style="
          font-size: 24px;
          color: #667eea;
          margin: 0;
          font-weight: 600;
        ">— ${customerName}</p>
      </div>

      <div style="
        margin-top: 40px;
        font-size: 20px;
        color: rgba(255, 255, 255, 0.9);
        font-weight: 500;
      ">
        ${businessName}
      </div>

      <div style="
        margin-top: 20px;
        font-size: 16px;
        color: rgba(255, 255, 255, 0.7);
      ">
        Powered by ProofViral
      </div>
    </div>
  `;

  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      backgroundColor: null,
      scale: 2,
      logging: false,
      useCORS: true,
      allowTaint: true
    });

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to generate image blob'));
        }
      }, 'image/png');
    });
  } finally {
    document.body.removeChild(container);
  }
}

export async function uploadSocialCard(blob: Blob ): Promise<string> {

  // This would upload to Supabase Storage
  // For now, we'll create a local URL
  return URL.createObjectURL(blob);
}
