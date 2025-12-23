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
  if (text.toLowerCase().includes('hi') || text.toLowerCase().includes('hello') || text === '') {
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
        {
          id: 'service1',
          title: '1️⃣ Custom Software Development',
          description: 'Tailored software solutions for your business needs',
          details: `Business Management Systems\n` +
                  `Inventory / POS Systems\n` +
                  `Accounting & Billing Systems\n` +
                  `CRM / ERP Systems`
        },
        {
          id: 'service2',
          title: '2️⃣ Web Application Development',
          description: 'Modern web applications with latest technologies',
          details: `Custom Web Applications\n` +
                  `Admin Dashboards\n` +
                  `Booking Systems\n` +
                  `Learning Management Systems (LMS)\n` +
                  `Job Portals / Classified Websites\n` +
                  `SaaS Platforms\n\n` +
                  `*Technologies:*\n` +
                  `React, Next.js, Node.js, PHP, Laravel, MySQL, Firebase`
        },
        {
          id: 'service3',
          title: '3️⃣ Website Development',
          description: 'Professional websites for businesses',
          details: `Business Websites\n` +
                  `Corporate Websites\n` +
                  `Portfolio Websites\n` +
                  `Blog & Content Websites\n` +
                  `Landing Pages\n` +
                  `Multi-language Websites\n\n` +
                  `✔️ Mobile Friendly\n` +
                  `✔️ Fast Loading\n` +
                  `✔️ SEO Ready`
        },
        {
          id: 'service4',
          title: '4️⃣ E-Commerce Solutions',
          description: 'Complete online store development',
          details: `Online Store Development\n` +
                  `Payment Gateway Integration\n` +
                  `Product & Order Management\n` +
                  `Customer Accounts\n` +
                  `Admin Panel\n` +
                  `Delivery & Invoice Systems`
        }
      ]
    },
    {
      title: '🏢 NovoNex Software Solutions – Our Services (Page 2/3)',
      services: [
        {
          id: 'service5',
          title: '5️⃣ Mobile Application Development',
          description: 'Native and hybrid mobile apps',
          details: `Android Applications\n` +
                  `iOS Applications\n` +
                  `Hybrid Apps (React Native / Flutter)\n` +
                  `App UI Design\n` +
                  `API Integration`
        },
        {
          id: 'service6',
          title: '6️⃣ UI / UX Design',
          description: 'User-centered design services',
          details: `Website UI Design\n` +
                  `Mobile App UI Design\n` +
                  `Dashboard UI Design\n` +
                  `User Experience Optimization\n` +
                  `Figma / Adobe XD Designs`
        },
        {
          id: 'service7',
          title: '7️⃣ AI & Automation Solutions',
          description: 'AI-powered business solutions',
          details: `AI-powered Web Apps\n` +
                  `Chatbots\n` +
                  `Image / Content Generation Tools\n` +
                  `Automation Systems\n` +
                  `AI Integration for Businesses`
        },
        {
          id: 'service8',
          title: '8️⃣ System Integration & API Development',
          description: 'Seamless system integration',
          details: `Third-party API Integration\n` +
                  `Payment Gateways\n` +
                  `SMS / Email Systems\n` +
                  `Maps & Location Services\n` +
                  `ERP / CRM Integration`
        }
      ]
    },
    {
      title: '🏢 NovoNex Software Solutions – Our Services (Page 3/3)',
      services: [
        {
          id: 'service9',
          title: '9️⃣ Cloud & Hosting Services',
          description: 'Reliable hosting solutions',
          details: `Domain Registration\n` +
                  `Web Hosting\n` +
                  `Cloud Deployment\n` +
                  `Server Setup & Maintenance\n` +
                  `Backup & Security Management`
        },
        {
          id: 'service10',
          title: '🔟 Maintenance & Technical Support',
          description: 'Ongoing technical support',
          details: `Software Maintenance\n` +
                  `Bug Fixing\n` +
                  `Feature Updates\n` +
                  `Performance Optimization\n` +
                  `Security Updates`
        },
        {
          id: 'service11',
          title: '1️⃣1️⃣ Digital Solutions & Consulting',
          description: 'Expert IT consultation',
          details: `IT Consulting\n` +
                  `Business Digital Transformation\n` +
                  `System Planning & Architecture\n` +
                  `Startup Tech Consultation`
        },
        {
          id: 'service12',
          title: '1️⃣2️⃣ Branding & Digital Presence',
          description: 'Complete branding solutions',
          details: `Logo Design\n` +
                  `Brand Identity\n` +
                  `Website Content Setup\n` +
                  `SEO Optimization\n` +
                  `Social Media Integration`
        }
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
          currentPage.services.map(service => 
            `${service.title}\n` +
            `${service.description}\n`
          ).join('\n'),
    buttons: buttons
  });
}

async function sendDigitalMenu(sock, from, page = 1) {
  const pages = [
    {
      title: '🚀 NovoNex Digital Works – Digital Marketing Services (Page 1/4)',
      services: [
        {
          id: 'service13',
          title: '1️⃣ Digital Marketing Strategy & Consulting',
          description: 'Comprehensive marketing planning',
          details: `Business Digital Marketing Planning\n` +
                  `Brand Growth Strategy\n` +
                  `Campaign Planning\n` +
                  `Market & Competitor Analysis\n` +
                  `Marketing Consultation`
        },
        {
          id: 'service14',
          title: '2️⃣ Social Media Marketing (SMM)',
          description: 'Complete social media management',
          details: `Facebook Marketing\n` +
                  `Instagram Marketing\n` +
                  `TikTok Marketing\n` +
                  `LinkedIn Marketing\n` +
                  `YouTube Channel Management\n\n` +
                  `✔️ Content Planning\n` +
                  `✔️ Post Designing\n` +
                  `✔️ Page Handling\n` +
                  `✔️ Engagement Growth`
        },
        {
          id: 'service15',
          title: '3️⃣ Social Media Advertising (Paid Ads)',
          description: 'Targeted advertising campaigns',
          details: `Facebook & Instagram Ads\n` +
                  `TikTok Ads\n` +
                  `Google Display Ads\n` +
                  `Lead Generation Campaigns\n` +
                  `Conversion & Sales Ads\n` +
                  `Retargeting Ads`
        }
      ]
    },
    {
      title: '🚀 NovoNex Digital Works – Digital Marketing Services (Page 2/4)',
      services: [
        {
          id: 'service16',
          title: '4️⃣ Content Creation & Creative Design',
          description: 'Creative content production',
          details: `Graphic Design (Posts, Banners, Flyers)\n` +
                  `Video Editing (Reels, Shorts, Ads)\n` +
                  `Motion Graphics\n` +
                  `Brand Visual Design\n` +
                  `AI-based Creative Content`
        },
        {
          id: 'service17',
          title: '5️⃣ Search Engine Optimization (SEO)',
          description: 'Improve search rankings',
          details: `On-Page SEO\n` +
                  `Technical SEO\n` +
                  `Keyword Research\n` +
                  `Content Optimization\n` +
                  `Google Ranking Improvement`
        },
        {
          id: 'service18',
          title: '6️⃣ Search Engine Marketing (SEM)',
          description: 'Paid search advertising',
          details: `Google Search Ads\n` +
                  `Google Shopping Ads\n` +
                  `Keyword Targeted Campaigns\n` +
                  `ROI-focused Ad Management`
        }
      ]
    },
    {
      title: '🚀 NovoNex Digital Works – Digital Marketing Services (Page 3/4)',
      services: [
        {
          id: 'service19',
          title: '7️⃣ Branding & Brand Identity',
          description: 'Complete branding solutions',
          details: `Logo Design\n` +
                  `Brand Guidelines\n` +
                  `Color & Typography System\n` +
                  `Visual Identity Design\n` +
                  `Brand Positioning`
        },
        {
          id: 'service20',
          title: '8️⃣ Website & Funnel Marketing',
          description: 'Conversion-focused marketing',
          details: `Landing Page Design\n` +
                  `Sales Funnel Setup\n` +
                  `Website Conversion Optimization\n` +
                  `Lead Capture Forms\n` +
                  `Email Integration`
        },
        {
          id: 'service21',
          title: '9️⃣ Email & WhatsApp Marketing',
          description: 'Direct marketing solutions',
          details: `Email Campaigns\n` +
                  `Newsletter Design\n` +
                  `WhatsApp Bulk Messaging\n` +
                  `Automation Setup\n` +
                  `Customer Follow-up Systems`
        }
      ]
    },
    {
      title: '🚀 NovoNex Digital Works – Digital Marketing Services (Page 4/4)',
      services: [
        {
          id: 'service22',
          title: '🔟 Influencer & Video Marketing',
          description: 'Video and influencer marketing',
          details: `Influencer Collaborations\n` +
                  `YouTube Video Marketing\n` +
                  `Short-form Video Strategy\n` +
                  `Reels & TikTok Growth Plans`
        },
        {
          id: 'service23',
          title: '1️⃣1️⃣ Analytics & Performance Tracking',
          description: 'Data-driven marketing insights',
          details: `Google Analytics Setup\n` +
                  `Meta Pixel Integration\n` +
                  `Campaign Performance Reports\n` +
                  `Audience Behavior Analysis\n` +
                  `Monthly Marketing Reports`
        },
        {
          id: 'service24',
          title: '1️⃣2️⃣ Local & Business Marketing',
          description: 'Local business promotion',
          details: `Google My Business Optimization\n` +
                  `Local SEO\n` +
                  `Map-based Business Promotion\n` +
                  `Review & Reputation Management`
        },
        {
          id: 'service25',
          title: '1️⃣3️⃣ Marketing Automation',
          description: 'Automated marketing systems',
          details: `CRM Integration\n` +
                  `Auto Lead Response Systems\n` +
                  `Chatbot Setup\n` +
                  `AI Automation for Marketing`
        }
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
          currentPage.services.map(service => 
            `${service.title}\n` +
            `${service.description}\n`
          ).join('\n'),
    buttons: buttons
  });
}

async function handleServiceSelection(sock, from, serviceId) {
  const serviceMap = {
    // Software Services
    'service1': {
      title: '1️⃣ Custom Software Development',
      details: `*Custom Software Development*\n\n` +
              `We create tailored software solutions that meet your specific business needs:\n\n` +
              `• Business Management Systems\n` +
              `• Inventory / POS Systems\n` +
              `• Accounting & Billing Systems\n` +
              `• CRM / ERP Systems\n\n` +
              `📞 *Contact for Custom Quote:*\n` +
              `NovoNex Software Solutions Hotline: 077 069 1283\n` +
              `Email: info@novonex.com`
    },
    'service2': {
      title: '2️⃣ Web Application Development',
      details: `*Web Application Development*\n\n` +
              `Modern web applications built with latest technologies:\n\n` +
              `• Custom Web Applications\n` +
              `• Admin Dashboards\n` +
              `• Booking Systems\n` +
              `• Learning Management Systems (LMS)\n` +
              `• Job Portals / Classified Websites\n` +
              `• SaaS Platforms\n\n` +
              `*Technologies:*\n` +
              `React, Next.js, Node.js, PHP, Laravel, MySQL, Firebase\n\n` +
              `📞 *Contact for Custom Quote:*\n` +
              `NovoNex Software Solutions Hotline: 077 069 1283\n` +
              `Email: info@novonex.com`
    },
    'service3': {
      title: '3️⃣ Website Development',
      details: `*Website Development*\n\n` +
              `Professional websites for all business types:\n\n` +
              `• Business Websites\n` +
              `• Corporate Websites\n` +
              `• Portfolio Websites\n` +
              `• Blog & Content Websites\n` +
              `• Landing Pages\n` +
              `• Multi-language Websites\n\n` +
              `✔️ Mobile Friendly\n` +
              `✔️ Fast Loading\n` +
              `✔️ SEO Ready\n\n` +
              `📞 *Contact for Custom Quote:*\n` +
              `NovoNex Software Solutions Hotline: 077 069 1283\n` +
              `Email: info@novonex.com`
    },
    'service4': {
      title: '4️⃣ E-Commerce Solutions',
      details: `*E-Commerce Solutions*\n\n` +
              `Complete online store development:\n\n` +
              `• Online Store Development\n` +
              `• Payment Gateway Integration\n` +
              `• Product & Order Management\n` +
              `• Customer Accounts\n` +
              `• Admin Panel\n` +
              `• Delivery & Invoice Systems\n\n` +
              `📞 *Contact for Custom Quote:*\n` +
              `NovoNex Software Solutions Hotline: 077 069 1283\n` +
              `Email: info@novonex.com`
    },
    'service5': {
      title: '5️⃣ Mobile Application Development',
      details: `*Mobile Application Development*\n\n` +
              `Native and hybrid mobile apps:\n\n` +
              `• Android Applications\n` +
              `• iOS Applications\n` +
              `• Hybrid Apps (React Native / Flutter)\n` +
              `• App UI Design\n` +
              `• API Integration\n\n` +
              `📞 *Contact for Custom Quote:*\n` +
              `NovoNex Software Solutions Hotline: 077 069 1283\n` +
              `Email: info@novonex.com`
    },
    'service6': {
      title: '6️⃣ UI / UX Design',
      details: `*UI / UX Design*\n\n` +
              `User-centered design services:\n\n` +
              `• Website UI Design\n` +
              `• Mobile App UI Design\n` +
              `• Dashboard UI Design\n` +
              `• User Experience Optimization\n` +
              `• Figma / Adobe XD Designs\n\n` +
              `📞 *Contact for Custom Quote:*\n` +
              `NovoNex Software Solutions Hotline: 077 069 1283\n` +
              `Email: info@novonex.com`
    },
    'service7': {
      title: '7️⃣ AI & Automation Solutions',
      details: `*AI & Automation Solutions*\n\n` +
              `AI-powered business solutions:\n\n` +
              `• AI-powered Web Apps\n` +
              `• Chatbots\n` +
              `• Image / Content Generation Tools\n` +
              `• Automation Systems\n` +
              `• AI Integration for Businesses\n\n` +
              `📞 *Contact for Custom Quote:*\n` +
              `NovoNex Software Solutions Hotline: 077 069 1283\n` +
              `Email: info@novonex.com`
    },
    'service8': {
      title: '8️⃣ System Integration & API Development',
      details: `*System Integration & API Development*\n\n` +
              `Seamless system integration:\n\n` +
              `• Third-party API Integration\n` +
              `• Payment Gateways\n` +
              `• SMS / Email Systems\n` +
              `• Maps & Location Services\n` +
              `• ERP / CRM Integration\n\n` +
              `📞 *Contact for Custom Quote:*\n` +
              `NovoNex Software Solutions Hotline: 077 069 1283\n` +
              `Email: info@novonex.com`
    },
    'service9': {
      title: '9️⃣ Cloud & Hosting Services',
      details: `*Cloud & Hosting Services*\n\n` +
              `Reliable hosting solutions:\n\n` +
              `• Domain Registration\n` +
              `• Web Hosting\n` +
              `• Cloud Deployment\n` +
              `• Server Setup & Maintenance\n` +
              `• Backup & Security Management\n\n` +
              `📞 *Contact for Custom Quote:*\n` +
              `NovoNex Software Solutions Hotline: 077 069 1283\n` +
              `Email: info@novonex.com`
    },
    'service10': {
      title: '🔟 Maintenance & Technical Support',
      details: `*Maintenance & Technical Support*\n\n` +
              `Ongoing technical support:\n\n` +
              `• Software Maintenance\n` +
              `• Bug Fixing\n` +
              `• Feature Updates\n` +
              `• Performance Optimization\n` +
              `• Security Updates\n\n` +
              `📞 *Contact for Custom Quote:*\n` +
              `NovoNex Software Solutions Hotline: 077 069 1283\n` +
              `Email: info@novonex.com`
    },
    'service11': {
      title: '1️⃣1️⃣ Digital Solutions & Consulting',
      details: `*Digital Solutions & Consulting*\n\n` +
              `Expert IT consultation:\n\n` +
              `• IT Consulting\n` +
              `• Business Digital Transformation\n` +
              `• System Planning & Architecture\n` +
              `• Startup Tech Consultation\n\n` +
              `📞 *Contact for Custom Quote:*\n` +
              `NovoNex Software Solutions Hotline: 077 069 1283\n` +
              `Email: info@novonex.com`
    },
    'service12': {
      title: '1️⃣2️⃣ Branding & Digital Presence',
      details: `*Branding & Digital Presence*\n\n` +
              `Complete branding solutions:\n\n` +
              `• Logo Design\n` +
              `• Brand Identity\n` +
              `• Website Content Setup\n` +
              `• SEO Optimization\n` +
              `• Social Media Integration\n\n` +
              `📞 *Contact for Custom Quote:*\n` +
              `NovoNex Software Solutions Hotline: 077 069 1283\n` +
              `Email: info@novonex.com`
    },
    // Digital Works Services
    'service13': {
      title: '1️⃣ Digital Marketing Strategy & Consulting',
      details: `*Digital Marketing Strategy & Consulting*\n\n` +
              `Comprehensive marketing planning:\n\n` +
              `• Business Digital Marketing Planning\n` +
              `• Brand Growth Strategy\n` +
              `• Campaign Planning\n` +
              `• Market & Competitor Analysis\n` +
              `• Marketing Consultation\n\n` +
              `📞 *Contact for Custom Quote:*\n` +
              `NovoNex Digital Works Hotline: 075 339 4278\n` +
              `Email: digital@novonex.com`
    },
    'service14': {
      title: '2️⃣ Social Media Marketing (SMM)',
      details: `*Social Media Marketing (SMM)*\n\n` +
              `Complete social media management:\n\n` +
              `• Facebook Marketing\n` +
              `• Instagram Marketing\n` +
              `• TikTok Marketing\n` +
              `• LinkedIn Marketing\n` +
              `• YouTube Channel Management\n\n` +
              `✔️ Content Planning\n` +
              `✔️ Post Designing\n` +
              `✔️ Page Handling\n` +
              `✔️ Engagement Growth\n\n` +
              `📞 *Contact for Custom Quote:*\n` +
              `NovoNex Digital Works Hotline: 075 339 4278\n` +
              `Email: digital@novonex.com`
    },
    'service15': {
      title: '3️⃣ Social Media Advertising (Paid Ads)',
      details: `*Social Media Advertising (Paid Ads)*\n\n` +
              `Targeted advertising campaigns:\n\n` +
              `• Facebook & Instagram Ads\n` +
              `• TikTok Ads\n` +
              `• Google Display Ads\n` +
              `• Lead Generation Campaigns\n` +
              `• Conversion & Sales Ads\n` +
              `• Retargeting Ads\n\n` +
              `📞 *Contact for Custom Quote:*\n` +
              `NovoNex Digital Works Hotline: 075 339 4278\n` +
              `Email: digital@novonex.com`
    },
    'service16': {
      title: '4️⃣ Content Creation & Creative Design',
      details: `*Content Creation & Creative Design*\n\n` +
              `Creative content production:\n\n` +
              `• Graphic Design (Posts, Banners, Flyers)\n` +
              `• Video Editing (Reels, Shorts, Ads)\n` +
              `• Motion Graphics\n` +
              `• Brand Visual Design\n` +
              `• AI-based Creative Content\n\n` +
              `📞 *Contact for Custom Quote:*\n` +
              `NovoNex Digital Works Hotline: 075 339 4278\n` +
              `Email: digital@novonex.com`
    },
    'service17': {
      title: '5️⃣ Search Engine Optimization (SEO)',
      details: `*Search Engine Optimization (SEO)*\n\n` +
              `Improve search rankings:\n\n` +
              `• On-Page SEO\n` +
              `• Technical SEO\n` +
              `• Keyword Research\n` +
              `• Content Optimization\n` +
              `• Google Ranking Improvement\n\n` +
              `📞 *Contact for Custom Quote:*\n` +
              `NovoNex Digital Works Hotline: 075 339 4278\n` +
              `Email: digital@novonex.com`
    },
    'service18': {
      title: '6️⃣ Search Engine Marketing (SEM)',
      details: `*Search Engine Marketing (SEM)*\n\n` +
              `Paid search advertising:\n\n` +
              `• Google Search Ads\n` +
              `• Google Shopping Ads\n` +
              `• Keyword Targeted Campaigns\n` +
              `• ROI-focused Ad Management\n\n` +
              `📞 *Contact for Custom Quote:*\n` +
              `NovoNex Digital Works Hotline: 075 339 4278\n` +
              `Email: digital@novonex.com`
    },
    'service19': {
      title: '7️⃣ Branding & Brand Identity',
      details: `*Branding & Brand Identity*\n\n` +
              `Complete branding solutions:\n\n` +
              `• Logo Design\n` +
              `• Brand Guidelines\n` +
              `• Color & Typography System\n` +
              `• Visual Identity Design\n` +
              `• Brand Positioning\n\n` +
              `📞 *Contact for Custom Quote:*\n` +
              `NovoNex Digital Works Hotline: 075 339 4278\n` +
              `Email: digital@novonex.com`
    },
    'service20': {
      title: '8️⃣ Website & Funnel Marketing',
      details: `*Website & Funnel Marketing*\n\n` +
              `Conversion-focused marketing:\n\n` +
              `• Landing Page Design\n` +
              `• Sales Funnel Setup\n` +
              `• Website Conversion Optimization\n` +
              `• Lead Capture Forms\n` +
              `• Email Integration\n\n` +
              `📞 *Contact for Custom Quote:*\n` +
              `NovoNex Digital Works Hotline: 075 339 4278\n` +
              `Email: digital@novonex.com`
    },
    'service21': {
      title: '9️⃣ Email & WhatsApp Marketing',
      details: `*Email & WhatsApp Marketing*\n\n` +
              `Direct marketing solutions:\n\n` +
              `• Email Campaigns\n` +
              `• Newsletter Design\n` +
              `• WhatsApp Bulk Messaging\n` +
              `• Automation Setup\n` +
              `• Customer Follow-up Systems\n\n` +
              `📞 *Contact for Custom Quote:*\n` +
              `NovoNex Digital Works Hotline: 075 339 4278\n` +
              `Email: digital@novonex.com`
    },
    'service22': {
      title: '🔟 Influencer & Video Marketing',
      details: `*Influencer & Video Marketing*\n\n` +
              `Video and influencer marketing:\n\n` +
              `• Influencer Collaborations\n` +
              `• YouTube Video Marketing\n` +
              `• Short-form Video Strategy\n` +
              `• Reels & TikTok Growth Plans\n\n` +
              `📞 *Contact for Custom Quote:*\n` +
              `NovoNex Digital Works Hotline: 075 339 4278\n` +
              `Email: digital@novonex.com`
    },
    'service23': {
      title: '1️⃣1️⃣ Analytics & Performance Tracking',
      details: `*Analytics & Performance Tracking*\n\n` +
              `Data-driven marketing insights:\n\n` +
              `• Google Analytics Setup\n` +
              `• Meta Pixel Integration\n` +
              `• Campaign Performance Reports\n` +
              `• Audience Behavior Analysis\n` +
              `• Monthly Marketing Reports\n\n` +
              `📞 *Contact for Custom Quote:*\n` +
              `NovoNex Digital Works Hotline: 075 339 4278\n` +
              `Email: digital@novonex.com`
    },
    'service24': {
      title: '1️⃣2️⃣ Local & Business Marketing',
      details: `*Local & Business Marketing*\n\n` +
              `Local business promotion:\n\n` +
              `• Google My Business Optimization\n` +
              `• Local SEO\n` +
              `• Map-based Business Promotion\n` +
              `• Review & Reputation Management\n\n` +
              `📞 *Contact for Custom Quote:*\n` +
              `NovoNex Digital Works Hotline: 075 339 4278\n` +
              `Email: digital@novonex.com`
    },
    'service25': {
      title: '1️⃣3️⃣ Marketing Automation',
      details: `*Marketing Automation*\n\n` +
              `Automated marketing systems:\n\n` +
              `• CRM Integration\n` +
              `• Auto Lead Response Systems\n` +
              `• Chatbot Setup\n` +
              `• AI Automation for Marketing\n\n` +
              `📞 *Contact for Custom Quote:*\n` +
              `NovoNex Digital Works Hotline: 075 339 4278\n` +
              `Email: digital@novonex.com`
    }
  };

  const service = serviceMap[serviceId];
  if (service) {
    await sock.sendMessage(from, {
      text: service.details,
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
}
