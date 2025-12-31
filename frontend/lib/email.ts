interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail({ to, subject, html, from }: SendEmailParams) {
  try {
    console.log('Sending email with params:', { to, subject, from });
    
    const response = await fetch('/api/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to,
        subject,
        html,
        from,
      }),
    });

    let responseData;
    try {
      // Try to parse JSON response
      responseData = await response.json();
    } catch (jsonError) {
      // If JSON parsing fails, get the text response instead
      const textResponse = await response.text();
      console.error('Failed to parse JSON response:', { 
        status: response.status, 
        statusText: response.statusText,
        responseText: textResponse 
      });
      throw new Error(`Invalid response from server: ${response.status} ${response.statusText}`);
    }

    if (!response.ok) {
      const errorInfo = {
        status: response.status,
        statusText: response.statusText,
        data: responseData,
      };
      console.error('Email API Error:', errorInfo);
      
      // Handle different error response formats
      const errorMessage = responseData?.message || 
                          responseData?.error?.message || 
                          responseData?.error ||
                          'Failed to send email';
      
      const error = new Error(typeof errorMessage === 'string' ? errorMessage : 'Failed to send email');
      (error as any).details = errorInfo;
      throw error;
    }

    return responseData;
  } catch (error) {
    console.error('Error in sendEmail:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw error; // Re-throw to be handled by the caller
  }
}
