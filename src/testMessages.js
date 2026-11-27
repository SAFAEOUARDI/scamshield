export const testMessages = [
  { id: 1, label: "Bank phishing", expected: "scam", text: "Your bank account will be blocked within 24 hours. Click here to confirm your details: bank-secure-example.com" },
  { id: 2, label: "Fake delivery", expected: "scam", text: "Your parcel is on hold. A customs fee of $2.50 is required to release it: parcel-track-example.com" },
  { id: 3, label: "Fake prize", expected: "scam", text: "Congratulations! You won a new iPhone 15. Reply with your full name and credit card number to receive your prize today." },
  { id: 4, label: "Fake job offer", expected: "scam", text: "Work from home and earn $800 per week. To register, send a $50 processing fee and a photo of your ID card." },
  { id: 5, label: "Family impersonation", expected: "scam", text: "Hi Mom, this is my new number, my phone broke. I need you to send $400 right now, I will pay you back tomorrow." },
  { id: 6, label: "Appointment reminder", expected: "legitimate", text: "Hello, this is a reminder of your appointment tomorrow at 10:00 AM at Dr. Alami's office. Please let us know if you cannot attend." },
  { id: 7, label: "Message from a friend", expected: "legitimate", text: "Hey, are you coming to the match tonight? Youssef and I will be at the stadium at 8." },
  { id: 8, label: "Real shipping notice", expected: "legitimate", text: "Your order #48213 has shipped and will arrive between November 27 and 29. No action is required." },
  { id: 9, label: "Family dinner", expected: "legitimate", text: "Dinner at Grandma's tomorrow at 8 PM. Don't forget to bring dessert!" },
  { id: 10, label: "Verification code", expected: "legitimate", text: "Your verification code is 482913. Do not share it with anyone. It expires in 10 minutes." },
];
