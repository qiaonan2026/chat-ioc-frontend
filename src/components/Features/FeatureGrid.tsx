import React from 'react';

interface Feature {
  id: string;
  title: string;
  icon: string;
}

const features: Feature[] = [
  { id: 'writing', title: 'AI写作', icon: '✍️' },
  { id: 'agents', title: '智能体大全', icon: '🤖' },
  { id: 'chat', title: '大模型聊天', icon: '💬' },
  { id: 'editing', title: '纳米P图', icon: '🖼️' },
  { id: 'video', title: 'P视频', icon: '🎬' },
  { id: 'reports', title: '研究报告', icon: '📊' },
  { id: 'ppt', title: 'PPT制作大师', icon: '📄' },
  { id: 'swot', title: 'SWOT分析', icon: '🔍' },
  { id: 'stock', title: '股票投资解读', icon: '📈' },
  { id: 'all', title: '全部', icon: '🌐' },
];

const FeatureGrid: React.FC = () => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
      {features.map((feature) => (
        <div 
          key={feature.id}
          className="bg-white rounded-xl p-4 flex flex-col items-center justify-center shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-100 hover:border-blue-200"
        >
          <div className="text-2xl mb-2">{feature.icon}</div>
          <h3 className="text-sm font-medium text-gray-800 text-center">{feature.title}</h3>
        </div>
      ))}
    </div>
  );
};

export default FeatureGrid;