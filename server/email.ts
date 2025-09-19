import { MailService } from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  throw new Error("SENDGRID_API_KEY environment variable must be set");
}

const mailService = new MailService();
mailService.setApiKey(process.env.SENDGRID_API_KEY);

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    await mailService.send({
      to: params.to,
      from: params.from || 'noreply@sghayratours.com',
      subject: params.subject,
      text: params.text,
      html: params.html,
    });
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}

// Email template system for multilingual notifications
interface BookingEmailData {
  customerName: string;
  customerEmail: string;
  activityTitle: string;
  bookingDate: string;
  groupSize: number;
  totalPrice: number;
  currency: string;
  depositAmount: number;
  bookingId: string;
  paymentStatus: 'unpaid' | 'deposit_paid' | 'fully_paid';
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
}

const emailTemplates = {
  bookingConfirmation: {
    en: {
      subject: (data: BookingEmailData) => `Booking Confirmation - ${data.activityTitle}`,
      html: (data: BookingEmailData) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <div style="background: linear-gradient(135deg, #D97706 0%, #F59E0B 100%); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px; font-weight: bold;">Sghayra Tours</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 16px;">Your Sahara Adventure Awaits</p>
          </div>
          
          <div style="padding: 30px;">
            <h2 style="color: #D97706; margin-bottom: 20px; font-size: 24px;">Booking Confirmed!</h2>
            
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
              Dear ${data.customerName},<br><br>
              Thank you for booking with Sghayra Tours! We're excited to take you on an unforgettable journey through the Tunisian Sahara.
            </p>
            
            <div style="background: #F9FAFB; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
              <h3 style="color: #D97706; margin-top: 0; margin-bottom: 15px; font-size: 18px;">Booking Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr style="border-bottom: 1px solid #E5E7EB;">
                  <td style="padding: 8px 0; font-weight: bold; color: #374151;">Activity:</td>
                  <td style="padding: 8px 0; color: #6B7280;">${data.activityTitle}</td>
                </tr>
                <tr style="border-bottom: 1px solid #E5E7EB;">
                  <td style="padding: 8px 0; font-weight: bold; color: #374151;">Date:</td>
                  <td style="padding: 8px 0; color: #6B7280;">${data.bookingDate}</td>
                </tr>
                <tr style="border-bottom: 1px solid #E5E7EB;">
                  <td style="padding: 8px 0; font-weight: bold; color: #374151;">Group Size:</td>
                  <td style="padding: 8px 0; color: #6B7280;">${data.groupSize} ${data.groupSize === 1 ? 'person' : 'people'}</td>
                </tr>
                <tr style="border-bottom: 1px solid #E5E7EB;">
                  <td style="padding: 8px 0; font-weight: bold; color: #374151;">Total Price:</td>
                  <td style="padding: 8px 0; color: #6B7280; font-weight: bold;">${data.totalPrice} ${data.currency}</td>
                </tr>
                <tr style="border-bottom: 1px solid #E5E7EB;">
                  <td style="padding: 8px 0; font-weight: bold; color: #374151;">Deposit Required:</td>
                  <td style="padding: 8px 0; color: #D97706; font-weight: bold;">${data.depositAmount} ${data.currency}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #374151;">Booking ID:</td>
                  <td style="padding: 8px 0; color: #6B7280; font-family: monospace;">${data.bookingId}</td>
                </tr>
              </table>
            </div>
            
            ${data.paymentStatus === 'unpaid' ? `
            <div style="background: #FEF3CD; border: 1px solid #F59E0B; border-radius: 8px; padding: 15px; margin-bottom: 25px;">
              <h4 style="color: #D97706; margin: 0 0 10px 0; font-size: 16px;">⚠️ Payment Required</h4>
              <p style="color: #92400E; margin: 0; font-size: 14px;">
                A deposit of ${data.depositAmount} ${data.currency} is required to secure your booking. Please contact us to complete the payment.
              </p>
            </div>
            ` : ''}
            
            <div style="background: #ECFDF5; border: 1px solid #10B981; border-radius: 8px; padding: 15px; margin-bottom: 25px;">
              <h4 style="color: #047857; margin: 0 0 10px 0; font-size: 16px;">📞 Contact Information</h4>
              <p style="color: #065F46; margin: 0; font-size: 14px;">
                Email: info@sghayratours.com<br>
                WhatsApp: +216 XX XXX XXX<br>
                We're here to help with any questions about your adventure!
              </p>
            </div>
            
            <p style="color: #6B7280; font-size: 14px; text-align: center; margin-top: 30px;">
              Thank you for choosing Sghayra Tours. We look forward to sharing the magic of the Sahara with you!
            </p>
          </div>
        </div>
      `,
    },
    fr: {
      subject: (data: BookingEmailData) => `Confirmation de Réservation - ${data.activityTitle}`,
      html: (data: BookingEmailData) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <div style="background: linear-gradient(135deg, #D97706 0%, #F59E0B 100%); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px; font-weight: bold;">Sghayra Tours</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 16px;">Votre Aventure au Sahara Vous Attend</p>
          </div>
          
          <div style="padding: 30px;">
            <h2 style="color: #D97706; margin-bottom: 20px; font-size: 24px;">Réservation Confirmée!</h2>
            
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
              Cher/Chère ${data.customerName},<br><br>
              Merci d'avoir réservé avec Sghayra Tours! Nous sommes ravis de vous emmener dans un voyage inoubliable à travers le Sahara tunisien.
            </p>
            
            <div style="background: #F9FAFB; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
              <h3 style="color: #D97706; margin-top: 0; margin-bottom: 15px; font-size: 18px;">Détails de la Réservation</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr style="border-bottom: 1px solid #E5E7EB;">
                  <td style="padding: 8px 0; font-weight: bold; color: #374151;">Activité:</td>
                  <td style="padding: 8px 0; color: #6B7280;">${data.activityTitle}</td>
                </tr>
                <tr style="border-bottom: 1px solid #E5E7EB;">
                  <td style="padding: 8px 0; font-weight: bold; color: #374151;">Date:</td>
                  <td style="padding: 8px 0; color: #6B7280;">${data.bookingDate}</td>
                </tr>
                <tr style="border-bottom: 1px solid #E5E7EB;">
                  <td style="padding: 8px 0; font-weight: bold; color: #374151;">Taille du Groupe:</td>
                  <td style="padding: 8px 0; color: #6B7280;">${data.groupSize} ${data.groupSize === 1 ? 'personne' : 'personnes'}</td>
                </tr>
                <tr style="border-bottom: 1px solid #E5E7EB;">
                  <td style="padding: 8px 0; font-weight: bold; color: #374151;">Prix Total:</td>
                  <td style="padding: 8px 0; color: #6B7280; font-weight: bold;">${data.totalPrice} ${data.currency}</td>
                </tr>
                <tr style="border-bottom: 1px solid #E5E7EB;">
                  <td style="padding: 8px 0; font-weight: bold; color: #374151;">Acompte Requis:</td>
                  <td style="padding: 8px 0; color: #D97706; font-weight: bold;">${data.depositAmount} ${data.currency}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #374151;">ID de Réservation:</td>
                  <td style="padding: 8px 0; color: #6B7280; font-family: monospace;">${data.bookingId}</td>
                </tr>
              </table>
            </div>
            
            ${data.paymentStatus === 'unpaid' ? `
            <div style="background: #FEF3CD; border: 1px solid #F59E0B; border-radius: 8px; padding: 15px; margin-bottom: 25px;">
              <h4 style="color: #D97706; margin: 0 0 10px 0; font-size: 16px;">⚠️ Paiement Requis</h4>
              <p style="color: #92400E; margin: 0; font-size: 14px;">
                Un acompte de ${data.depositAmount} ${data.currency} est requis pour sécuriser votre réservation. Veuillez nous contacter pour finaliser le paiement.
              </p>
            </div>
            ` : ''}
            
            <div style="background: #ECFDF5; border: 1px solid #10B981; border-radius: 8px; padding: 15px; margin-bottom: 25px;">
              <h4 style="color: #047857; margin: 0 0 10px 0; font-size: 16px;">📞 Informations de Contact</h4>
              <p style="color: #065F46; margin: 0; font-size: 14px;">
                Email: info@sghayratours.com<br>
                WhatsApp: +216 XX XXX XXX<br>
                Nous sommes là pour répondre à toutes vos questions sur votre aventure!
              </p>
            </div>
            
            <p style="color: #6B7280; font-size: 14px; text-align: center; margin-top: 30px;">
              Merci d'avoir choisi Sghayra Tours. Nous avons hâte de partager la magie du Sahara avec vous!
            </p>
          </div>
        </div>
      `,
    },
    de: {
      subject: (data: BookingEmailData) => `Buchungsbestätigung - ${data.activityTitle}`,
      html: (data: BookingEmailData) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <div style="background: linear-gradient(135deg, #D97706 0%, #F59E0B 100%); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px; font-weight: bold;">Sghayra Tours</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 16px;">Ihr Sahara-Abenteuer Wartet</p>
          </div>
          
          <div style="padding: 30px;">
            <h2 style="color: #D97706; margin-bottom: 20px; font-size: 24px;">Buchung Bestätigt!</h2>
            
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
              Liebe/r ${data.customerName},<br><br>
              Vielen Dank für Ihre Buchung bei Sghayra Tours! Wir freuen uns darauf, Sie auf eine unvergessliche Reise durch die tunesische Sahara mitzunehmen.
            </p>
            
            <div style="background: #F9FAFB; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
              <h3 style="color: #D97706; margin-top: 0; margin-bottom: 15px; font-size: 18px;">Buchungsdetails</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr style="border-bottom: 1px solid #E5E7EB;">
                  <td style="padding: 8px 0; font-weight: bold; color: #374151;">Aktivität:</td>
                  <td style="padding: 8px 0; color: #6B7280;">${data.activityTitle}</td>
                </tr>
                <tr style="border-bottom: 1px solid #E5E7EB;">
                  <td style="padding: 8px 0; font-weight: bold; color: #374151;">Datum:</td>
                  <td style="padding: 8px 0; color: #6B7280;">${data.bookingDate}</td>
                </tr>
                <tr style="border-bottom: 1px solid #E5E7EB;">
                  <td style="padding: 8px 0; font-weight: bold; color: #374151;">Gruppengröße:</td>
                  <td style="padding: 8px 0; color: #6B7280;">${data.groupSize} ${data.groupSize === 1 ? 'Person' : 'Personen'}</td>
                </tr>
                <tr style="border-bottom: 1px solid #E5E7EB;">
                  <td style="padding: 8px 0; font-weight: bold; color: #374151;">Gesamtpreis:</td>
                  <td style="padding: 8px 0; color: #6B7280; font-weight: bold;">${data.totalPrice} ${data.currency}</td>
                </tr>
                <tr style="border-bottom: 1px solid #E5E7EB;">
                  <td style="padding: 8px 0; font-weight: bold; color: #374151;">Erforderliche Anzahlung:</td>
                  <td style="padding: 8px 0; color: #D97706; font-weight: bold;">${data.depositAmount} ${data.currency}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #374151;">Buchungs-ID:</td>
                  <td style="padding: 8px 0; color: #6B7280; font-family: monospace;">${data.bookingId}</td>
                </tr>
              </table>
            </div>
            
            ${data.paymentStatus === 'unpaid' ? `
            <div style="background: #FEF3CD; border: 1px solid #F59E0B; border-radius: 8px; padding: 15px; margin-bottom: 25px;">
              <h4 style="color: #D97706; margin: 0 0 10px 0; font-size: 16px;">⚠️ Zahlung Erforderlich</h4>
              <p style="color: #92400E; margin: 0; font-size: 14px;">
                Eine Anzahlung von ${data.depositAmount} ${data.currency} ist erforderlich, um Ihre Buchung zu sichern. Bitte kontaktieren Sie uns, um die Zahlung abzuschließen.
              </p>
            </div>
            ` : ''}
            
            <div style="background: #ECFDF5; border: 1px solid #10B981; border-radius: 8px; padding: 15px; margin-bottom: 25px;">
              <h4 style="color: #047857; margin: 0 0 10px 0; font-size: 16px;">📞 Kontaktinformationen</h4>
              <p style="color: #065F46; margin: 0; font-size: 14px;">
                E-Mail: info@sghayratours.com<br>
                WhatsApp: +216 XX XXX XXX<br>
                Wir helfen Ihnen gerne bei Fragen zu Ihrem Abenteuer!
              </p>
            </div>
            
            <p style="color: #6B7280; font-size: 14px; text-align: center; margin-top: 30px;">
              Vielen Dank, dass Sie sich für Sghayra Tours entschieden haben. Wir freuen uns darauf, die Magie der Sahara mit Ihnen zu teilen!
            </p>
          </div>
        </div>
      `,
    },
    ar: {
      subject: (data: BookingEmailData) => `تأكيد الحجز - ${data.activityTitle}`,
      html: (data: BookingEmailData) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); direction: rtl; text-align: right;">
          <div style="background: linear-gradient(135deg, #D97706 0%, #F59E0B 100%); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px; font-weight: bold;">سغيرة تورز</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 16px;">مغامرتك في الصحراء تنتظرك</p>
          </div>
          
          <div style="padding: 30px;">
            <h2 style="color: #D97706; margin-bottom: 20px; font-size: 24px;">تم تأكيد الحجز!</h2>
            
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
              عزيزي/عزيزتي ${data.customerName}،<br><br>
              شكرًا لك على الحجز مع سغيرة تورز! نحن متحمسون لاصطحابك في رحلة لا تُنسى عبر الصحراء التونسية.
            </p>
            
            <div style="background: #F9FAFB; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
              <h3 style="color: #D97706; margin-top: 0; margin-bottom: 15px; font-size: 18px;">تفاصيل الحجز</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr style="border-bottom: 1px solid #E5E7EB;">
                  <td style="padding: 8px 0; color: #6B7280;">${data.activityTitle}</td>
                  <td style="padding: 8px 0; font-weight: bold; color: #374151;">:النشاط</td>
                </tr>
                <tr style="border-bottom: 1px solid #E5E7EB;">
                  <td style="padding: 8px 0; color: #6B7280;">${data.bookingDate}</td>
                  <td style="padding: 8px 0; font-weight: bold; color: #374151;">:التاريخ</td>
                </tr>
                <tr style="border-bottom: 1px solid #E5E7EB;">
                  <td style="padding: 8px 0; color: #6B7280;">${data.groupSize} ${data.groupSize === 1 ? 'شخص' : 'أشخاص'}</td>
                  <td style="padding: 8px 0; font-weight: bold; color: #374151;">:حجم المجموعة</td>
                </tr>
                <tr style="border-bottom: 1px solid #E5E7EB;">
                  <td style="padding: 8px 0; color: #6B7280; font-weight: bold;">${data.totalPrice} ${data.currency}</td>
                  <td style="padding: 8px 0; font-weight: bold; color: #374151;">:السعر الإجمالي</td>
                </tr>
                <tr style="border-bottom: 1px solid #E5E7EB;">
                  <td style="padding: 8px 0; color: #D97706; font-weight: bold;">${data.depositAmount} ${data.currency}</td>
                  <td style="padding: 8px 0; font-weight: bold; color: #374151;">:العربون المطلوب</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6B7280; font-family: monospace;">${data.bookingId}</td>
                  <td style="padding: 8px 0; font-weight: bold; color: #374151;">:رقم الحجز</td>
                </tr>
              </table>
            </div>
            
            ${data.paymentStatus === 'unpaid' ? `
            <div style="background: #FEF3CD; border: 1px solid #F59E0B; border-radius: 8px; padding: 15px; margin-bottom: 25px;">
              <h4 style="color: #D97706; margin: 0 0 10px 0; font-size: 16px;">⚠️ مطلوب دفع</h4>
              <p style="color: #92400E; margin: 0; font-size: 14px;">
                عربون قدره ${data.depositAmount} ${data.currency} مطلوب لضمان حجزك. يرجى الاتصال بنا لإكمال الدفع.
              </p>
            </div>
            ` : ''}
            
            <div style="background: #ECFDF5; border: 1px solid #10B981; border-radius: 8px; padding: 15px; margin-bottom: 25px;">
              <h4 style="color: #047857; margin: 0 0 10px 0; font-size: 16px;">📞 معلومات الاتصال</h4>
              <p style="color: #065F46; margin: 0; font-size: 14px;">
                البريد الإلكتروني: info@sghayratours.com<br>
                واتساب: +216 XX XXX XXX<br>
                نحن هنا للمساعدة في أي أسئلة حول مغامرتك!
              </p>
            </div>
            
            <p style="color: #6B7280; font-size: 14px; text-align: center; margin-top: 30px;">
              شكرًا لاختيارك سغيرة تورز. نتطلع لمشاركة سحر الصحراء معك!
            </p>
          </div>
        </div>
      `,
    },
  },
  statusUpdate: {
    en: {
      subject: (data: BookingEmailData) => `Booking Update - ${data.activityTitle}`,
      html: (data: BookingEmailData) => {
        const getStatusMessage = () => {
          switch (data.status) {
            case 'confirmed':
              return 'Your booking has been confirmed! We look forward to your adventure.';
            case 'cancelled':
              return 'Your booking has been cancelled. If you have any questions, please contact us.';
            case 'completed':
              return 'Thank you for choosing Sghayra Tours! We hope you had an amazing experience.';
            default:
              return 'Your booking status has been updated.';
          }
        };

        return `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <div style="background: linear-gradient(135deg, #D97706 0%, #F59E0B 100%); color: white; padding: 30px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px; font-weight: bold;">Sghayra Tours</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 16px;">Booking Status Update</p>
            </div>
            
            <div style="padding: 30px;">
              <h2 style="color: #D97706; margin-bottom: 20px; font-size: 24px;">Status Update</h2>
              
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
                Dear ${data.customerName},<br><br>
                ${getStatusMessage()}
              </p>
              
              <div style="background: #F9FAFB; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
                <h3 style="color: #D97706; margin-top: 0; margin-bottom: 15px; font-size: 18px;">Booking Details</h3>
                <p style="color: #6B7280; margin: 0;"><strong>Booking ID:</strong> ${data.bookingId}</p>
                <p style="color: #6B7280; margin: 5px 0;"><strong>Activity:</strong> ${data.activityTitle}</p>
                <p style="color: #6B7280; margin: 5px 0;"><strong>Status:</strong> <span style="color: #D97706; font-weight: bold; text-transform: uppercase;">${data.status}</span></p>
              </div>
              
              <div style="background: #ECFDF5; border: 1px solid #10B981; border-radius: 8px; padding: 15px; margin-bottom: 25px;">
                <h4 style="color: #047857; margin: 0 0 10px 0; font-size: 16px;">📞 Contact Information</h4>
                <p style="color: #065F46; margin: 0; font-size: 14px;">
                  Email: info@sghayratours.com<br>
                  WhatsApp: +216 XX XXX XXX
                </p>
              </div>
            </div>
          </div>
        `;
      },
    },
    // Add other languages...
  },
};

export async function sendBookingConfirmationEmail(
  bookingData: BookingEmailData,
  language: 'en' | 'fr' | 'de' | 'ar' = 'en'
): Promise<boolean> {
  try {
    const template = emailTemplates.bookingConfirmation[language];
    
    // Format date for display
    const formattedDate = new Date(bookingData.bookingDate).toLocaleDateString(
      language === 'ar' ? 'ar-TN' : language === 'fr' ? 'fr-FR' : language === 'de' ? 'de-DE' : 'en-US',
      { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }
    );

    const emailData = { ...bookingData, bookingDate: formattedDate };

    return await sendEmail({
      to: bookingData.customerEmail,
      from: 'noreply@sghayratours.com', // This should be your verified SendGrid sender
      subject: template.subject(emailData),
      html: template.html(emailData),
    });
  } catch (error) {
    console.error('Error sending booking confirmation email:', error);
    return false;
  }
}

export async function sendBookingStatusUpdateEmail(
  bookingData: BookingEmailData,
  language: 'en' | 'fr' | 'de' | 'ar' = 'en'
): Promise<boolean> {
  try {
    const template = (emailTemplates.statusUpdate as any)[language] || emailTemplates.statusUpdate.en;

    const formattedDate = new Date(bookingData.bookingDate).toLocaleDateString(
      language === 'ar' ? 'ar-TN' : language === 'fr' ? 'fr-FR' : language === 'de' ? 'de-DE' : 'en-US',
      { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }
    );

    const emailData = { ...bookingData, bookingDate: formattedDate };

    return await sendEmail({
      to: bookingData.customerEmail,
      from: 'noreply@sghayratours.com',
      subject: template.subject(emailData),
      html: template.html(emailData),
    });
  } catch (error) {
    console.error('Error sending status update email:', error);
    return false;
  }
}