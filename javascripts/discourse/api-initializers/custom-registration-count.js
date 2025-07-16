import { apiInitializer } from "discourse/lib/api";

export default apiInitializer("0.8", (api) => {
  api.onPageChange(() => {
    fetch('/about.json')
      .then(response => response.json())
      .then(data => {
        const realUsers = data.about?.stats?.users_count || 0;
        const fakeUsers = settings.total_registered_users || 0;
        const totalUsers = realUsers + fakeUsers;      
        displayUserCount(totalUsers);
      })
      .catch(error => {
        const fakeUsers = settings.total_registered_users || 0;
        if (fakeUsers > 0) {
          displayUserCount(fakeUsers);
        }
      });
  });
  
  function displayUserCount(totalUsers) {
    let defaultText;
    const currentLocale = I18n.locale || 'en';
    
    switch(currentLocale) {
      case 'zh_CN':
        defaultText = '总注册用户数';
        break;
      case 'zh_TW':
        defaultText = '總註冊用戶數';
        break;
      case 'en':
      default:
        defaultText = 'Total Registered Users';
        break;
    }
    
    const themeSettings = (typeof settings !== 'undefined') ? settings : {};
    const displayText = themeSettings.registration_count_text || defaultText;
    
    if (totalUsers && totalUsers > 0) {
      const existing = document.querySelector('.custom-registration-count');
      if (existing) {
        existing.remove();
      }
      
      const isMobile = window.innerWidth <= 767;
      const isTablet = window.innerWidth > 767 && window.innerWidth <= 1024;
      
      const container = document.createElement('div');
      container.className = 'custom-registration-count';
      
      let formattedNumber = totalUsers.toLocaleString();
      
      if (isMobile && totalUsers >= 1000) {
        if (totalUsers >= 1000000) {
          formattedNumber = (totalUsers / 1000000).toFixed(1) + 'M';
        } else if (totalUsers >= 1000) {
          formattedNumber = (totalUsers / 1000).toFixed(1) + 'K';
        }
      }
      
      container.innerHTML = `
        <div class="registration-count-container">
          <span class="registration-count-text">${displayText}:</span>
          <span class="registration-count-number">${formattedNumber}</span>
        </div>
      `;
      
      let target;
      
      if (isMobile) {
        const mobileSelectors = [
          '.sidebar-sections',
          '#sidebar-wrapper', 
          '.sidebar',
          '.hamburger-panel .sidebar-sections',
          '.hamburger-panel',
          '.menu-panel .sidebar-sections',
          '.menu-panel',
          '.revamped.menu-panel',
          '[data-ember-action*="sidebar"] .sidebar-sections',
          '.sidebar-hamburger-dropdown .sidebar-sections',
          '.sidebar-hamburger-dropdown'
        ];
        
        for (const selector of mobileSelectors) {
          target = document.querySelector(selector);
          if (target) {
            break;
          }
        }
        
        if (!target) {
          setTimeout(() => {
            displayUserCount(totalUsers);
          }, 500);
          return;
        }
        
      } else {
        target = document.querySelector('.sidebar-sections') || 
                document.querySelector('#sidebar-wrapper') ||
                document.querySelector('.sidebar') ||
                document.querySelector('#main-outlet') || 
                document.querySelector('.container') ||
                document.querySelector('body');
      }
      
      if (target) {
        if (target.classList.contains('hamburger-panel') || 
            target.classList.contains('menu-panel') ||
            target.classList.contains('sidebar-hamburger-dropdown')) {
          const sidebarSections = target.querySelector('.sidebar-sections');
          if (sidebarSections) {
            sidebarSections.insertBefore(container, sidebarSections.firstChild);
          } else {
            target.insertBefore(container, target.firstChild);
          }
        } else if (target.classList.contains('sidebar-sections') || 
                   target.id === 'sidebar-wrapper' || 
                   target.classList.contains('sidebar')) {
          target.insertBefore(container, target.firstChild);
        } else {
          target.insertBefore(container, target.firstChild);
        }
      }
    }
  }
  
  api.onPageChange(() => {
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const event = new Event('discourse:page-changed');
        window.dispatchEvent(event);
      }, 250);
    });
  });
}); 