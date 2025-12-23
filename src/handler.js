import { userState } from './userState.js';
import { handleCallButton } from './features/callButton.js';
import { handleUrlButton } from './features/urlButton.js';
import { handleQuickReplyButton } from './features/quickReplyButton.js';
import { handleCopyButton } from './features/copyButton.js';

export async function handler(sock, msg) {
  // Check if message exists
  if (!msg?.message) return;
  
  const from = msg.key.remoteJid;
  
  // Skip group messages completely
  if (from.endsWith('@g.us')) {
    return;
  }
  
  // 🔴 IMPORTANT: Check if the message is a reply to the bot's message
  // We'll track which messages need a reply
  
  let rowId;
  try {
    if (msg.message?.interactiveResponseMessage?.nativeFlowResponseMessage) {
      rowId = JSON.parse(msg.message.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson).id;
    } else if (msg.message?.listResponseMessage?.singleSelectReply?.selectedRowId) {
      rowId = msg.message.listResponseMessage.singleSelectReply.selectedRowId;
    }
  } catch {}

  const btnId = msg.message?.buttonsResponseMessage?.selectedButtonId;

  // Handle navigation buttons - these are always responses to bot's messages
  if (btnId === 'next_page' || btnId === 'prev_page' || btnId === 'back_to_main') {
    const state = userState.get(from) || { step: 'start', page: 1 };
    
    if (btnId === 'next_page') {
      userState.set(from, { step: 'menuMain', page: state.page + 1 });
      await sendIntroMenu(sock, from, state.page + 1);
      return;
    }

    if (btnId === 'prev_page') {
      userState.set(from, { step: 'menuMain', page: state.page - 1 });
      await sendIntroMenu(sock, from, state.page - 1);
      return;
    }

    if (btnId === 'back_to_main') {
      userState.set(from, { step: 'menuMain', page: 1 });
      await sendIntroMenu(sock, from, 1);
      return;
    }
  }

  // Handle menu selections from bot's interactive messages
  if (rowId) {
    switch (rowId) {
      case 'call':
        await handleCallButton(sock, from);
        break;
      case 'url':
        await handleUrlButton(sock, from);
        break;
      case 'quick':
        await handleQuickReplyButton(sock, from);
        break;
      case 'copy':
        await handleCopyButton(sock, from);
        break;
      case 'service1':
        await sock.sendMessage(from, { 
          text: '📌 *Custom Software Development*\n\nWe create tailored software solutions that meet your specific business needs. From enterprise applications to specialized tools, we build software that drives efficiency and growth.' 
        });
        break;
      case 'service2':
        await sock.sendMessage(from, { 
          text: '🌐 *Web & Website Development*\n\nProfessional website development services including responsive design, e-commerce platforms, content management systems, and custom web applications.' 
        });
        break;
      case 'service3':
        await sock.sendMessage(from, { 
          text: '🛒 *E-Commerce Solutions*\n\nComplete e-commerce development including shopping carts, payment gateway integration, inventory management, and mobile-responsive storefronts.' 
        });
        break;
      case 'service4':
        await sock.sendMessage(from, { 
          text: '📱 *Mobile App Development*\n\nNative and cross-platform mobile applications for iOS and Android. We build user-friendly apps with modern frameworks and technologies.' 
        });
        break;
      case 'service5':
        await sock.sendMessage(from, { 
          text: '🎨 *UI / UX Design*\n\nUser-centered design services that create intuitive, engaging, and visually appealing interfaces for websites and applications.' 
        });
        break;
      case 'service6':
        await sock.sendMessage(from, { 
          text: '🤖 *AI & Automation Solutions*\n\nImplement AI-powered solutions including chatbots, process automation, machine learning models, and intelligent data analysis.' 
        });
        break;
      case 'service7':
        await sock.sendMessage(from, { 
          text: '🔌 *API Integration*\n\nSeamless integration of various systems and services through custom API development, third-party API integration, and middleware solutions.' 
        });
        break;
      case 'service8':
        await sock.sendMessage(from, { 
          text: '☁️ *Cloud & Hosting Services*\n\nCloud migration, setup, and management services. We offer hosting solutions with high availability, scalability, and security.' 
        });
        break;
      case 'service9':
        await sock.sendMessage(from, { 
          text: '🛠️ *Maintenance & Support*\n\nOngoing technical support, maintenance, updates, and monitoring services to keep your systems running smoothly.' 
        });
        break;
      case 'service10':
        await sock.sendMessage(from, { 
          text: '💼 *Digital Consulting*\n\nExpert advice on digital transformation, technology strategy, system architecture, and digital optimization for your business.' 
        });
        break;
      case 'service11':
        await sock.sendMessage(from, { 
          text: '📢 *Branding & SEO*\n\nComprehensive branding services and search engine optimization to improve your online visibility and brand recognition.' 
        });
        break;
      case 'service12':
        await sock.sendMessage(from, { 
          text: '📞 *Contact & Get a Quote*\n\nReady to start your project? Contact us for a free consultation and detailed quote.\n\n📧 Email: info@novonex.com\n🌐 Website: www.novonex.com\n📱 Phone: +94 77 123 4567' 
        });
        break;
      default:
        await sock.sendMessage(from, { 
          text: 'Please select a valid option from the menu.' 
        });
    }
    return;
  }

  // 🔴 CRITICAL CHANGE: Check if this is a reply to bot's message
  // We'll check if the message has contextInfo (reply context)
  const isReply = msg.message?.extendedTextMessage?.contextInfo;
  const quotedMessage = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  
  // Check if it's a reply AND the quoted message contains bot's signature
  const isReplyToBot = isReply && (
    quotedMessage?.conversation?.includes('NovoNex') ||
    quotedMessage?.conversation?.includes('Services Menu') ||
    quotedMessage?.conversation?.includes('Choose an option')
  );
  
  // Also check if it's a direct response to interactive buttons
  const isButtonResponse = btnId || rowId;
  
  // Extract message text
  const messageText = msg.message?.conversation || 
                     msg.message?.extendedTextMessage?.text ||
                     '';
  
  // Get user state
  const state = userState.get(from) || { step: 'start', page: 1, lastBotMessageId: null };
  
  // 🔴 ONLY respond if:
  // 1. It's a button response (already handled above)
  // 2. OR it's a reply to bot's message
  // 3. OR it's the VERY FIRST message from this user
  const isFirstMessage = state.step === 'start';
  
  if (isButtonResponse || isReplyToBot || isFirstMessage) {
    if (isFirstMessage) {
      // First message from user
      await sock.sendMessage(from, {
        text: `👋 *Hello! Welcome to NovoNex Support!*\n\nThank you for contacting us. I'm your personal assistant. Here's how I can help you:`
      });
      await sendIntroMenu(sock, from, 1);
      userState.set(from, { step: 'menuMain', page: 1, lastBotMessageId: null });
    } else if (isReplyToBot || messageText.toLowerCase().includes('menu')) {
      // User replied to bot or asked for menu
      await sock.sendMessage(from, {
        text: `📋 *Here's our services menu again.*\n\nSelect an option below to learn more:`
      });
      await sendIntroMenu(sock, from, state.page);
    }
    return;
  }
  
  // If none of the above conditions are met, DO NOT RESPOND
  // This prevents the bot from responding to every random message
  console.log(`🤐 Ignoring message from ${from}: "${messageText.substring(0, 50)}..."`);
}

async function sendIntroMenu(sock, from, page = 1) {
  const pages = [
    {
      title: 'Development Services',
      rows: [
        { title: '📌 Custom Software Development', description: 'Tailored software solutions', id: 'service1' },
        { title: '🌐 Web & Website Development', description: 'Professional web development', id: 'service2' },
        { title: '🛒 E-Commerce Solutions', description: 'Online store development', id: 'service3' },
        { title: '📱 Mobile App Development', description: 'iOS & Android apps', id: 'service4' },
        { title: '🎨 UI / UX Design', description: 'User interface design', id: 'service5' },
        { title: '🤖 AI & Automation Solutions', description: 'AI integration & automation', id: 'service6' },
      ],
    },
    {
      title: 'Technical & Business Services',
      rows: [
        { title: '🔌 API Integration', description: 'System integration services', id: 'service7' },
        { title: '☁️ Cloud & Hosting Services', description: 'Cloud solutions & hosting', id: 'service8' },
        { title: '🛠️ Maintenance & Support', description: 'Ongoing support & maintenance', id: 'service9' },
        { title: '💼 Digital Consulting', description: 'Expert digital consulting', id: 'service10' },
        { title: '📢 Branding & SEO', description: 'Branding & SEO optimization', id: 'service11' },
        { title: '📞 Contact & Get a Quote', description: 'Get in touch for quotes', id: 'service12' },
      ],
    },
    {
      title: 'Button Demos',
      rows: [
        { title: '📞 Call Button Demo', description: 'Example: Call Button', id: 'call' },
        { title: '🔗 URL Button Demo', description: 'Example: URL Button', id: 'url' },
        { title: '⚡ Quick Reply Button Demo', description: 'Example: Quick Reply Button', id: 'quick' },
        { title: '📋 Copy Button Demo', description: 'Example: Copy Button', id: 'copy' },
      ],
    }
  ];

  const currentPage = pages[page - 1];
  const totalPages = pages.length;

  let footerText = `Page ${page} of ${totalPages} | NovoNex Software Solutions`;
  
  // Create navigation buttons
  const buttons = [];
  
  if (page > 1) {
    buttons.push({
      buttonId: 'prev_page',
      buttonText: { displayText: '⬅️ Previous' },
      type: 1
    });
  }
  
  buttons.push({
    buttonId: 'back_to_main',
    buttonText: { displayText: '🏠 Main Menu' },
    type: 1
  });
  
  if (page < totalPages) {
    buttons.push({
      buttonId: 'next_page',
      buttonText: { displayText: 'Next ➡️' },
      type: 1
    });
  }

  await sock.sendMessage(from, {
    text: `🤖 *Choose an option from the menu below:*`,
    subtitle: currentPage.title,
    footer: footerText,
    interactiveButtons: [
      {
        name: 'single_select',
        buttonParamsJson: JSON.stringify({
          title: `Services Menu (Page ${page}/${totalPages})`,
          sections: [
            {
              title: currentPage.title,
              rows: currentPage.rows,
            },
          ],
        }),
      },
    ],
    buttons: buttons
  });
}
