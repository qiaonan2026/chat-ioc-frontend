import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
          <a 
            href="/agreements/protocol" 
            className="hover:text-blue-600 transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            使用协议
          </a>
          <a 
            href="/agreements/privacy" 
            className="hover:text-blue-600 transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            隐私条款
          </a>
          <a 
            href="http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=12011602300304" 
            className="hover:text-blue-600 transition-colors flex items-center"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img 
              src="/src/assets/beian-icon.png" 
              alt="公安备案图标" 
              className="h-4 w-4 mr-1"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
            津公网安备12011602300304号
          </a>
          <a 
            href="https://beian.miit.gov.cn/" 
            className="hover:text-blue-600 transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            津ICP备20006251号-21
          </a>
          <a 
            href="/agreements/license" 
            className="hover:text-blue-600 transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            工商营业执照
          </a>
          <div className="flex items-center text-gray-500">
            备案信息
            <img 
              src="/src/assets/info-icon.png" 
              alt="信息图标" 
              className="h-4 w-4 ml-1"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </div>
        </div>
        <div className="mt-6 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} 纳米AI. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;