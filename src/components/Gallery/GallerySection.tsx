import React from 'react';

interface GalleryItem {
  id: string;
  title: string;
  imageUrl: string;
}

const galleryItems: GalleryItem[] = [
  { id: '1', title: '销售喜报｜见证业绩夺冠时刻', imageUrl: '/src/assets/gallery/1.jpg' },
  { id: '2', title: '春日爆品自己代言', imageUrl: '/src/assets/gallery/2.jpg' },
  { id: '3', title: '春日电商海报｜新品上市', imageUrl: '/src/assets/gallery/3.jpg' },
  { id: '4', title: '春日彩妆焕新｜满减赠礼享不停', imageUrl: '/src/assets/gallery/4.jpg' },
  { id: '5', title: '足下有风，与春同行', imageUrl: '/src/assets/gallery/5.jpg' },
  { id: '6', title: '春日限定，颜值与质感双在线', imageUrl: '/src/assets/gallery/6.jpg' },
  { id: '7', title: '春日踏浪去，海滨拍尽浪漫', imageUrl: '/src/assets/gallery/7.jpg' },
  { id: '8', title: '萌宠变装｜番茄系治愈风一键生成', imageUrl: '/src/assets/gallery/8.jpg' },
  { id: '9', title: '春日海报｜万物被一笔唤醒', imageUrl: '/src/assets/gallery/9.jpg' },
  { id: '10', title: '春日露营好物焕新', imageUrl: '/src/assets/gallery/10.jpg' },
  { id: '11', title: '5折特惠治愈来袭', imageUrl: '/src/assets/gallery/11.jpg' },
  { id: '12', title: '暖春橙花温柔大片', imageUrl: '/src/assets/gallery/12.jpg' },
];

const GallerySection: React.FC = () => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {galleryItems.map((item) => (
        <div 
          key={item.id}
          className="group cursor-pointer"
        >
          <div className="aspect-square overflow-hidden rounded-lg mb-2">
            <img 
              src={item.imageUrl} 
              alt={item.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 24 24"><rect width="24" height="24" fill="%23E5E7EB"/><path d="M5 8.5h14a1 1 0 011 1v10a1 1 0 01-1 1H5a1 1 0 01-1-1v-10a1 1 0 011-1m13 10l-4-5-3 3.5L8 13l-5 6h18" fill="%239CA3AF"/></svg>';
              }}
            />
          </div>
          <p className="text-xs text-gray-700 line-clamp-2">{item.title}</p>
        </div>
      ))}
    </div>
  );
};

export default GallerySection;