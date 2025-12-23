import { userState } from './userState.js';

export async function handler(sock, msg) {
  if (!msg?.message) return;
  const from = msg.key.remoteJid;
  const state = userState.get(from) || { step: 'start', page: 1, company: null };

  // Group messages ignore කරන්න
  if (from.endsWith('@g.us')) return;

  const text = msg.message?.conversation || 
                msg.message?.extendedTextMessage?.text || 
                msg.message?.buttonsResponseMessage?.selectedButtonId ||
                '';

  // Welcome message for any text
  if (text.toLowerCase().includes('hi') || text.toLowerCase().includes('hello') || text === '' || text.toLowerCase().includes('start')) {
    await sendWelcomeMenu(sock, from);
    userState.set(from, { step: 'welcome', page: 1, company: null });
    return;
  }

  // Handle company selection
  if (text === '1' || text.toLowerCase().includes('software')) {
    userState.set(from, { step: 'software', page: 1, company: 'software' });
    await sendSoftwareMenu(sock, from, 1);
    return;
  }

  if (text === '2' || text.toLowerCase().includes('digital')) {
    userState.set(from, { step: 'digital', page: 1, company: 'digital' });
    await sendDigitalMenu(sock, from, 1);
    return;
  }

  // Handle navigation buttons
  if (text === 'next_page') {
    if (state.company === 'software') {
      userState.set(from, { ...state, page: state.page + 1 });
      await sendSoftwareMenu(sock, from, state.page + 1);
    } else if (state.company === 'digital') {
      userState.set(from, { ...state, page: state.page + 1 });
      await sendDigitalMenu(sock, from, state.page + 1);
    }
    return;
  }

  if (text === 'prev_page') {
    if (state.company === 'software') {
      userState.set(from, { ...state, page: state.page - 1 });
      await sendSoftwareMenu(sock, from, state.page - 1);
    } else if (state.company === 'digital') {
      userState.set(from, { ...state, page: state.page - 1 });
      await sendDigitalMenu(sock, from, state.page - 1);
    }
    return;
  }

  if (text === 'back_to_welcome') {
    userState.set(from, { step: 'welcome', page: 1, company: null });
    await sendWelcomeMenu(sock, from);
    return;
  }

  if (text === 'contact_info') {
    await sock.sendMessage(from, {
      text: `📞 *Contact Information*\n\n` +
            `*NovoNex Software Solutions:*\n` +
            `📱 Hotline: 077 069 1283\n` +
            `📧 Email: info@novonex.com\n` +
            `🌐 Website: www.novonex.com\n\n` +
            `*NovoNex Digital Works:*\n` +
            `📱 Hotline: 075 339 4278\n` +
            `📧 Email: digital@novonex.com\n` +
            `🌐 Website: digital.novonex.com`
    });
    return;
  }

  // Handle service selections
  if (text.startsWith('service')) {
    await handleServiceSelection(sock, from, text);
    return;
  }

  // If no match, show welcome
  await sendWelcomeMenu(sock, from);
}

async function sendWelcomeMenu(sock, from) {
  await sock.sendMessage(from, {
    text: `🤖 *Welcome to NovoNex!*\n\n` +
          `We provide comprehensive technology and digital solutions for your business.\n\n` +
          `*Please select a service category:*\n\n` +
          `1️⃣ *NovoNex Software Solutions*\n` +
          `   - Custom Software Development\n` +
          `   - Web & Mobile Applications\n` +
          `   - System Integration\n\n` +
          `2️⃣ *NovoNex Digital Works*\n` +
          `   - Digital Marketing\n` +
          `   - Social Media Management\n` +
          `   - Branding & SEO\n\n` +
          `*Type 1 or 2 to continue, or reply with your query.*`,
    buttons: [
      {
        buttonId: '1',
        buttonText: { displayText: '🚀 Software Solutions' }
      },
      {
        buttonId: '2',
        buttonText: { displayText: '📱 Digital Works' }
      },
      {
        buttonId: 'contact_info',
        buttonText: { displayText: '📞 Contact Info' }
      }
    ]
  });
}

async function sendSoftwareMenu(sock, from, page = 1) {
  const pages = [
    {
      title: '🏢 NovoNex Software Solutions – Our Services (Page 1/3)',
      services: [
        { id: 'service1', title: '1️⃣ Custom Software Development' },
        { id: 'service2', title: '2️⃣ Web Application Development' },
        { id: 'service3', title: '3️⃣ Website Development' },
        { id: 'service4', title: '4️⃣ E-Commerce Solutions' }
      ]
    },
    {
      title: '🏢 NovoNex Software Solutions – Our Services (Page 2/3)',
      services: [
        { id: 'service5', title: '5️⃣ Mobile Application Development' },
        { id: 'service6', title: '6️⃣ UI / UX Design' },
        { id: 'service7', title: '7️⃣ AI & Automation Solutions' },
        { id: 'service8', title: '8️⃣ System Integration & API Development' }
      ]
    },
    {
      title: '🏢 NovoNex Software Solutions – Our Services (Page 3/3)',
      services: [
        { id: 'service9', title: '9️⃣ Cloud & Hosting Services' },
        { id: 'service10', title: '🔟 Maintenance & Technical Support' },
        { id: 'service11', title: '1️⃣1️⃣ Digital Solutions & Consulting' },
        { id: 'service12', title: '1️⃣2️⃣ Branding & Digital Presence' }
      ]
    }
  ];

  const currentPage = pages[page - 1];
  const buttons = [];

  if (page > 1) {
    buttons.push({
      buttonId: 'prev_page',
      buttonText: { displayText: '⬅️ Previous' }
    });
  }

  buttons.push({
    buttonId: 'back_to_welcome',
    buttonText: { displayText: '🏠 Main Menu' }
  });

  if (page < pages.length) {
    buttons.push({
      buttonId: 'next_page',
      buttonText: { displayText: 'Next ➡️' }
    });
  }

  buttons.push({
    buttonId: 'contact_info',
    buttonText: { displayText: '📞 Contact Info' }
  });

  await sock.sendMessage(from, {
    text: `*${currentPage.title}*\n\n` +
          `*Select a service for more details:*\n\n` +
          currentPage.services.map(service => service.title).join('\n'),
    buttons: buttons
  });
}

async function sendDigitalMenu(sock, from, page = 1) {
  const pages = [
    {
      title: '🚀 NovoNex Digital Works – Digital Marketing Services (Page 1/4)',
      services: [
        { id: 'service13', title: '1️⃣ Digital Marketing Strategy & Consulting' },
        { id: 'service14', title: '2️⃣ Social Media Marketing (SMM)' },
        { id: 'service15', title: '3️⃣ Social Media Advertising (Paid Ads)' }
      ]
    },
    {
      title: '🚀 NovoNex Digital Works – Digital Marketing Services (Page 2/4)',
      services: [
        { id: 'service16', title: '4️⃣ Content Creation & Creative Design' },
        { id: 'service17', title: '5️⃣ Search Engine Optimization (SEO)' },
        { id: 'service18', title: '6️⃣ Search Engine Marketing (SEM)' }
      ]
    },
    {
      title: '🚀 NovoNex Digital Works – Digital Marketing Services (Page 3/4)',
      services: [
        { id: 'service19', title: '7️⃣ Branding & Brand Identity' },
        { id: 'service20', title: '8️⃣ Website & Funnel Marketing' },
        { id: 'service21', title: '9️⃣ Email & WhatsApp Marketing' }
      ]
    },
    {
      title: '🚀 NovoNex Digital Works – Digital Marketing Services (Page 4/4)',
      services: [
        { id: 'service22', title: '🔟 Influencer & Video Marketing' },
        { id: 'service23', title: '1️⃣1️⃣ Analytics & Performance Tracking' },
        { id: 'service24', title: '1️⃣2️⃣ Local & Business Marketing' },
        { id: 'service25', title: '1️⃣3️⃣ Marketing Automation' }
      ]
    }
  ];

  const currentPage = pages[page - 1];
  const buttons = [];

  if (page > 1) {
    buttons.push({
      buttonId: 'prev_page',
      buttonText: { displayText: '⬅️ Previous' }
    });
  }

  buttons.push({
    buttonId: 'back_to_welcome',
    buttonText: { displayText: '🏠 Main Menu' }
  });

  if (page < pages.length) {
    buttons.push({
      buttonId: 'next_page',
      buttonText: { displayText: 'Next ➡️' }
    });
  }

  buttons.push({
    buttonId: 'contact_info',
    buttonText: { displayText: '📞 Contact Info' }
  });

  await sock.sendMessage(from, {
    text: `*${currentPage.title}*\n\n` +
          `*Select a service for more details:*\n\n` +
          currentPage.services.map(service => service.title).join('\n'),
    buttons: buttons
  });
}

async function handleServiceSelection(sock, from, serviceId) {
  const serviceDetails = {
    'service1': `*1️⃣ Custom Software Development*\n\n• Business Management Systems\n• Inventory / POS Systems\n• Accounting & Billing Systems\n• CRM / ERP Systems\n\n📞 Contact: 077 069 1283`,
    'service2': `*2️⃣ Web Application Development*\n\n• Custom Web Applications\n• Admin Dashboards\n• Booking Systems\n• Learning Management Systems (LMS)\n• Job Portals\n• SaaS Platforms\n\n📞 Contact: 077 069 1283`,
    'service3': `*3️⃣ Website Development*\n\n• Business Websites\n• Corporate Websites\n• Portfolio Websites\n• Blog & Content Websites\n• Landing Pages\n• Multi-language Websites\n\n📞 Contact: 077 069 1283`,
    'service4': `*4️⃣ E-Commerce Solutions*\n\n• Online Store Development\n• Payment Gateway Integration\n• Product & Order Management\n• Customer Accounts\n• Admin Panel\n\n📞 Contact: 077 069 1283`,
    'service5': `*5️⃣ Mobile Application Development*\n\n• Android Applications\n• iOS Applications\n• Hybrid Apps (React Native / Flutter)\n• App UI Design\n• API Integration\n\n📞 Contact: 077 069 1283`,
    'service6': `*6️⃣ UI / UX Design*\n\n• Website UI Design\n• Mobile App UI Design\n• Dashboard UI Design\n• User Experience Optimization\n• Figma / Adobe XD Designs\n\n📞 Contact: 077 069 1283`,
    'service7': `*7️⃣ AI & Automation Solutions*\n\n• AI-powered Web Apps\n• Chatbots\n• Image / Content Generation Tools\n• Automation Systems\n• AI Integration for Businesses\n\n📞 Contact: 077 069 1283`,
    'service8': `*8️⃣ System Integration & API Development*\n\n• Third-party API Integration\n• Payment Gateways\n• SMS / Email Systems\n• Maps & Location Services\n• ERP / CRM Integration\n\n📞 Contact: 077 069 1283`,
    'service9': `*9️⃣ Cloud & Hosting Services*\n\n• Domain Registration\n• Web Hosting\n• Cloud Deployment\n• Server Setup & Maintenance\n• Backup & Security Management\n\n📞 Contact: 077 069 1283`,
    'service10': `*🔟 Maintenance & Technical Support*\n\n• Software Maintenance\n• Bug Fixing\n• Feature Updates\n• Performance Optimization\n• Security Updates\n\n📞 Contact: 077 069 1283`,
    'service11': `*1️⃣1️⃣ Digital Solutions & Consulting*\n\n• IT Consulting\n• Business Digital Transformation\n• System Planning & Architecture\n• Startup Tech Consultation\n\n📞 Contact: 077 069 1283`,
    'service12': `*1️⃣2️⃣ Branding & Digital Presence*\n\n• Logo Design\n• Brand Identity\n• Website Content Setup\n• SEO Optimization\n• Social Media Integration\n\n📞 Contact: 077 069 1283`,
    'service13': `*1️⃣ Digital Marketing Strategy & Consulting*\n\n• Business Digital Marketing Planning\n• Brand Growth Strategy\n• Campaign Planning\n• Market & Competitor Analysis\n• Marketing Consultation\n\n📞 Contact: 075 339 4278`,
    'service14': `*2️⃣ Social Media Marketing (SMM)*\n\n• Facebook Marketing\n• Instagram Marketing\n• TikTok Marketing\n• LinkedIn Marketing\n• YouTube Channel Management\n\n📞 Contact: 075 339 4278`,
    'service15': `*3️⃣ Social Media Advertising (Paid Ads)*\n\n• Facebook & Instagram Ads\n• TikTok Ads\n• Google Display Ads\n• Lead Generation Campaigns\n• Conversion & Sales Ads\n\n📞 Contact: 075 339 4278`,
    'service16': `*4️⃣ Content Creation & Creative Design*\n\n• Graphic Design (Posts, Banners, Flyers)\n• Video Editing (Reels, Shorts, Ads)\n• Motion Graphics\n• Brand Visual Design\n\n📞 Contact: 075 339 4278`,
    'service17': `*5️⃣ Search Engine Optimization (SEO)*\n\n• On-Page SEO\n• Technical SEO\n• Keyword Research\n• Content Optimization\n• Google Ranking Improvement\n\n📞 Contact: 075 339 4278`,
    'service18': `*6️⃣ Search Engine Marketing (SEM)*\n\n• Google Search Ads\n• Google Shopping Ads\n• Keyword Targeted Campaigns\n• ROI-focused Ad Management\n\n📞 Contact: 075 339 4278`,
    'service19': `*7️⃣ Branding & Brand Identity*\n\n• Logo Design\n• Brand Guidelines\n• Color & Typography System\n• Visual Identity Design\n• Brand Positioning\n\n📞 Contact: 075 339 4278`,
    'service20': `*8️⃣ Website & Funnel Marketing*\n\n• Landing Page Design\n• Sales Funnel Setup\n• Website Conversion Optimization\n• Lead Capture Forms\n• Email Integration\n\n📞 Contact: 075 339 4278`,
    'service21': `*9️⃣ Email & WhatsApp Marketing*\n\n• Email Campaigns\n• Newsletter Design\n• WhatsApp Bulk Messaging\n• Automation Setup\n• Customer Follow-up Systems\n\n📞 Contact: 075 339 4278`,
    'service22': `*🔟 Influencer & Video Marketing*\n\n• Influencer Collaborations\n• YouTube Video Marketing\n• Short-form Video Strategy\n• Reels & TikTok Growth Plans\n\n📞 Contact: 075 339 4278`,
    'service23': `*1️⃣1️⃣ Analytics & Performance Tracking*\n\n• Google Analytics Setup\n• Meta Pixel Integration\n• Campaign Performance Reports\n• Audience Behavior Analysis\n• Monthly Marketing Reports\n\n📞 Contact: 075 339 4278`,
    'service24': `*1️⃣2️⃣ Local & Business Marketing*\n\n• Google My Business Optimization\n• Local SEO\n• Map-based Business Promotion\n• Review & Reputation Management\n\n📞 Contact: 075 339 4278`,
    'service25': `*1️⃣3️⃣ Marketing Automation*\n\n• CRM Integration\n• Auto Lead Response Systems\n• Chatbot Setup\n• AI Automation for Marketing\n\n📞 Contact: 075 339 4278`
  };

  const details = serviceDetails[serviceId] || `Service details not found.\n\n📞 Contact:\nSoftware Solutions: 077 069 1283\nDigital Works: 075 339 4278`;

  await sock.sendMessage(from, {
    text: details,
    buttons: [
      {
        buttonId: 'back_to_welcome',
        buttonText: { displayText: '🏠 Main Menu' }
      },
      {
        buttonId: 'contact_info',
        buttonText: { displayText: '📞 More Contact Info' }
      }
    ]
  });
}
