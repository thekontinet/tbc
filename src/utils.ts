export function generatePaymentReference() {
    // Generate a random 6-character alphanumeric string
    const randomString = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    // Get the current timestamp in milliseconds
    const timestamp = new Date().getTime();
  
    // Combine the random string and timestamp to create the payment reference number
    const paymentReference = `VTP-${timestamp}-${randomString}`;
  
    return paymentReference;
}

export function extractDataPlanFromString(text:string) {
    const regex = /(\d+)(\s*GB|\s*MB|\s*TB)/i;
    const matches = text.match(regex);
  
    if (matches && matches.length > 0) {
      return matches[0];
    } else {
      return null;
    }
}
  