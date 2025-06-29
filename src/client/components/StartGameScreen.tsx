/**
 * 开始游戏界面组件
 * 基于 project 设计稿的精确像素级实现
 * 支持拖拽猫咪选择大洲和拖拽方式选择猫咪
 * 
 * @author 开发者B - UI/UX 界面负责人
 */

import React, { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';

interface StartGameScreenProps {
  onStartGame: (playerInfo: {
    playerName: string;
    continentId: string;
    catAvatarId: string;
  }) => void;
  onBackToLaunch?: () => void;
}

interface DragState {
  isDragging: boolean;
  draggedCat: any;
  offsetX: number;
  offsetY: number;
}

export const StartGameScreen: React.FC<StartGameScreenProps> = ({ onStartGame, onBackToLaunch }) => {
  const [inputText, setInputText] = useState("");
  const [continentId, setContinentId] = useState('');
  const [selectedCat, setSelectedCat] = useState<any>(null);
  const [hoveredContinentId, setHoveredContinentId] = useState(''); // 悬停的大洲
  const [showError, setShowError] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedCat: null,
    offsetX: 0,
    offsetY: 0,
  });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  // 使用 ref 来避免闭包问题
  const dragStateRef = useRef<DragState>({
    isDragging: false,
    draggedCat: null,
    offsetX: 0,
    offsetY: 0,
  });

  // 可爱的猫咪相关名字
  const catNames = [
    "Whiskers", "Mittens", "Shadow", "Luna", "Simba", "Nala", "Felix", "Garfield",
    "Tigger", "Smokey", "Patches", "Oreo", "Snowball", "Ginger", "Coco", "Pepper",
    "Muffin", "Cookie", "Pumpkin", "Honey", "Caramel", "Mocha", "Latte", "Espresso",
    "Buttercup", "Daisy", "Rose", "Lily", "Violet", "Jasmine", "Sage", "Basil",
    "Pickles", "Peanut", "Jellybean", "Marshmallow", "Cupcake", "Biscuit", "Waffle", "Pancake",
    "Ziggy", "Zorro", "Bandit", "Scout", "Hunter", "Ranger", "Storm", "Thunder",
    "Angel", "Princess", "Duchess", "Queen", "King", "Prince", "Duke", "Earl",
    "Fluffy", "Fuzzy", "Snuggles", "Cuddles", "Bubbles", "Giggles", "Wiggles", "Nibbles"
];

  // 六大洲列表及其在地图上的精确位置 (相对于地图容器)
const CONTINENTS = [
    { code: 'NA', name: 'North America', flag: 'NA', top: 68, left: 55 },
    { code: 'SA', name: 'South America', flag: 'SA', top: 165, left: 108 },
    { code: 'EU', name: 'Europe', flag: 'EU', top: 70, left: 210 },
    { code: 'AF', name: 'Africa', flag: 'AF', top: 130, left: 190 },
    { code: 'AS', name: 'Asia', flag: 'AS', top: 90, left: 290 },
    { code: 'OC', name: 'Oceania', flag: 'OC', top: 180, left: 310 },
];

  // 猫咪头像选择数据 - 修复图片路径，使用正确的文件名
  const cats = [
    { id: 1, src: "/Map_Cat_1.png", alt: "Cat", width: "w-12", height: "h-12" },
    { id: 2, src: "/Map_Cat_2.png", alt: "Avatar cat", width: "w-12", height: "h-12", objectCover: true },
    { id: 3, src: "/Map_Cat_3.png", alt: "Cat", width: "w-[49px]", height: "h-[49px]" },
    { id: 4, src: "/Map_Cat_4.png", alt: "Cat", width: "w-[45px]", height: "h-[55px]" },
    { id: 5, src: "/Map_Cat_5.png", alt: "Cat", width: "w-[49px]", height: "h-[49px]" },
    { id: 6, src: "/Cat_5.png", alt: "Cat", width: "w-[49px]", height: "h-[49px]" },
  ];

  // 生成随机猫咪名字
  const generateRandomName = () => {
    const randomIndex = Math.floor(Math.random() * catNames.length);
    const selectedName = catNames[randomIndex];
    if (selectedName) {
      setInputText(selectedName);
    }
    setShowError(false);
  };

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    if (e.target.value.trim()) {
      setShowError(false);
    }
  };

  // 计算两点间距离
  const getDistance = (x1: number, y1: number, x2: number, y2: number) => {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  };

  // 检查是否靠近大洲位置 (相对于地图区域的坐标)
  const checkContinentProximity = (x: number, y: number) => {
    const threshold = 50; // 吸附距离阈值
    for (const continent of CONTINENTS) {
      const distance = getDistance(x, y, continent.left, continent.top);
      if (distance <= threshold) {
        return continent;
      }
    }
    return null;
  };

  // 处理鼠标按下开始拖拽 - 支持从猫咪选择区域或地图上开始
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>, cat: any, fromMap = false) => {
    e.preventDefault();
    const element = e.currentTarget as HTMLDivElement;
    element.style.cursor = 'grabbing';
    
    // 如果选择了新的猫咪，重置大洲选择
    if (!fromMap && selectedCat?.id !== cat.id) {
      setContinentId('');
      setHoveredContinentId('');
    }
    
    // 无论是否已经选中，都设置为当前猫咪并开始拖拽
    setSelectedCat(cat);

    // 立即设置鼠标位置和开始拖拽状态
    const offsetX = 25; // 猫咪图片的一半宽度
    const offsetY = 25; // 猫咪图片的一半高度
    
    const newDragState = {
      isDragging: true,
      draggedCat: cat,
      offsetX,
      offsetY,
    };
    
    setDragState(newDragState);
    dragStateRef.current = newDragState; // 同步更新 ref
    setMousePosition({ x: e.clientX, y: e.clientY });

    // 如果是从地图上开始拖拽，清除该位置的猫咪
    if (fromMap) {
      setContinentId('');
    }

    // 添加全局鼠标事件监听
    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);
  };

  // 全局鼠标移动处理
  const handleGlobalMouseMove = (e: MouseEvent) => {
    if (!dragStateRef.current.isDragging) return; // 使用 ref 检查状态
    setMousePosition({ x: e.clientX, y: e.clientY });

    // 检查是否悬停在地图区域内的大洲上
    const mapContainer = containerRef.current?.querySelector('.map-container') as HTMLElement;
    if (mapContainer) {
      const mapRect = mapContainer.getBoundingClientRect();
      const x = e.clientX - mapRect.left;
      const y = e.clientY - mapRect.top;

      // 检查是否在地图范围内
      if (x >= 0 && x <= 364 && y >= 0 && y <= 222) {
        const nearestContinent = checkContinentProximity(x, y);
        setHoveredContinentId(nearestContinent?.code || '');
      } else {
        setHoveredContinentId('');
      }
    }
  };

  // 全局鼠标释放处理
  const handleGlobalMouseUp = (e: MouseEvent) => {
    if (!dragStateRef.current.isDragging) return; // 使用 ref 检查状态

    // 恢复鼠标样式
    const elements = document.querySelectorAll('.cat-card');
    elements.forEach(el => {
      (el as HTMLElement).style.cursor = 'grab';
    });

    // 检查是否释放在地图区域内
    const mapContainer = containerRef.current?.querySelector('.map-container') as HTMLElement;
    if (mapContainer) {
      const mapRect = mapContainer.getBoundingClientRect();
      const x = e.clientX - mapRect.left;
      const y = e.clientY - mapRect.top;

      // 检查是否在地图范围内
      if (x >= 0 && x <= 364 && y >= 0 && y <= 222) {
        const nearestContinent = checkContinentProximity(x, y);
        if (nearestContinent) {
          setContinentId(nearestContinent.code);
          console.log(`Selected continent: ${nearestContinent.name} at position (${x}, ${y})`);
        }
      }
    }

    // 清理拖拽状态
    const newDragState = {
      isDragging: false,
      draggedCat: null,
      offsetX: 0,
      offsetY: 0,
    };
    setDragState(newDragState);
    dragStateRef.current = newDragState; // 同步更新 ref
    setHoveredContinentId('');

    // 移除全局事件监听
    document.removeEventListener('mousemove', handleGlobalMouseMove);
    document.removeEventListener('mouseup', handleGlobalMouseUp);
  };

  // 处理开始按钮点击
  const handleStartClick = () => {
    if (!inputText.trim()) {
      setShowError(true);
      setIsShaking(true);
      
      setTimeout(() => {
        setIsShaking(false);
      }, 500);
      
      return;
    }

    if (!selectedCat) {
      setShowError(true);
      setIsShaking(true);
      
      setTimeout(() => {
        setIsShaking(false);
      }, 500);
      
      return;
    }
    
    // 调用回调函数开始游戏
    onStartGame({
      playerName: inputText.trim(),
      continentId: continentId || 'AS', // 默认亚洲
      catAvatarId: selectedCat.id.toString(),
    });
  };

  // 处理关闭按钮点击
  const handleCloseClick = () => {
    console.log("Close button clicked!");
    if (onBackToLaunch) {
      onBackToLaunch();
    }
  };

  // 获取选中大洲的信息
  const selectedContinent = CONTINENTS.find(c => c.code === continentId);

  return (
    <div ref={containerRef} className="w-[724px] h-[584px] bg-[#2f2f2f] mx-auto relative">
      <div className="relative h-[584px] bg-[url('/Bg_Main.png')] bg-cover bg-center bg-no-repeat">
        <Card className="flex flex-col w-[607px] h-[489px] items-center justify-center gap-[10px] py-[43px] px-5 absolute top-[53px] left-[52px] bg-[#b7efff] rounded-[71.667px] border-[4.095px] border-solid border-white flex-shrink-0">
          <CardContent className="flex flex-col w-[545px] items-center justify-center gap-4 p-0">

            {/* 玩家名字输入框 */}
            <div className={`relative w-[531px] h-[59px] bg-[#f9f2e6] rounded-[24.81px] border-[2.84px] border-solid transition-all duration-200 ${
              showError ? 'border-[#FA2E2E] animate-shake' : 'border-white'
            } ${isShaking ? 'animate-shake' : ''}`}>
              <Input
                className="h-full w-full bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-center placeholder:text-center font-vt323 !text-2xl placeholder:font-vt323 placeholder:!text-2xl"
                placeholder="Type your name here"
                value={inputText}
                onChange={handleInputChange}
              />
              <Button
                className="absolute w-[49px] h-[49px] top-px right-[31px] p-0 bg-transparent hover:bg-transparent shadow-none hover:scale-105 transition-transform duration-200"
                type="button"
              onClick={generateRandomName}
              >
                <img
                  className="w-full h-full object-cover"
                  alt="Button random"
                  src="/Button_Random.png"
                />
              </Button>
        </div>

            {/* 地图区域 */}
            <div className="relative w-[364px] h-[222px] map-container">
              <img
                className="relative w-[364px] h-[222px] pointer-events-none"
                alt="Map"
                src="/map.png"
              />
              
              {/* 大洲目标区域 */}
              {CONTINENTS.map((continent) => {
                const isSelected = continentId === continent.code;
                const isHovered = hoveredContinentId === continent.code && dragState.isDragging;
                
                return (
                  <div
                key={continent.code}
                    className={`absolute w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                      isSelected
                        ? 'border-[#f0bc08] bg-[#f0bc08] bg-opacity-40 scale-125'
                        : isHovered
                        ? 'border-[#f0bc08] bg-[#f0bc08] bg-opacity-20 scale-110'
                        : 'border-white bg-white bg-opacity-30'
                }`}
                    style={{
                      top: `${continent.top}px`,
                      left: `${continent.left}px`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    <div className="w-full h-full flex items-center justify-center">
                      <span className={`text-[1.25rem] font-bold ${isSelected ? 'text-white' : isHovered ? 'text-white' : 'text-[#f0bc08]'}`}>{continent.flag}</span>
          </div>
        </div>
                );
              })}

              {/* 在地图上显示已选中的猫咪 */}
              {selectedContinent && selectedCat && !dragState.isDragging && (
                <div
                  className="absolute cursor-grab"
                  style={{
                    top: `${selectedContinent.top - 15}px`, // 稍微偏上一点
                    left: `${selectedContinent.left + 25}px`, // 在大洲点右边
                    transform: 'translate(-50%, -50%)',
                  }}
                  onMouseDown={(e) => handleMouseDown(e, selectedCat, true)}
              >
                  <img
                    className="w-8 h-8 object-cover drop-shadow-lg"
                    alt={selectedCat.alt}
                    src={selectedCat.src}
                    draggable={false}
                  />
          </div>
          )}
        </div>

            {/* 猫咪选择区域 - 拖拽源 */}
            <div className="flex items-center gap-[13px] relative self-stretch w-full flex-[0_0_auto]">
              {cats.map((cat, index) => (
                <Card
                  key={cat.id}
                  className={`cat-card flex ${index === 2 || index === 3 ? "flex-col" : ""} w-20 h-20 items-center justify-center gap-2.5 p-1 relative bg-[#f9f3e6] rounded-2xl border-2 cursor-grab active:cursor-grabbing transition-all duration-200 hover:scale-105 select-none ${
                    selectedCat?.id === cat.id ? 'border-[#f0bc08] shadow-lg' : 'border-white'
                  } ${dragState.isDragging && dragState.draggedCat?.id === cat.id ? 'opacity-30' : ''}`}
                  onMouseDown={(e) => handleMouseDown(e, cat)}
                  onMouseUp={(e) => {
                    const element = e.currentTarget as HTMLDivElement;
                    element.style.cursor = 'grab';
                  }}
                >
                  <img
                    className={`relative ${cat.width} ${cat.height} ${cat.objectCover ? "object-cover" : ""} pointer-events-none`}
                    alt={cat.alt}
                    src={cat.src}
                    draggable={false}
                  />
                  
                  {/* 选中指示器 */}
                  {selectedCat?.id === cat.id && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#f0bc08] rounded-full border-2 border-white flex items-center justify-center z-20">
                      <span className="text-white text-xs font-bold">✓</span>
              </div>
                  )}
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 关闭按钮 - 严格按照 project 位置 */}
        <Button 
          className="absolute w-[110px] h-[51px] top-[520px] left-[223px] p-0 bg-transparent hover:bg-transparent cursor-pointer transition-all duration-200 hover:scale-105 hover:brightness-110 active:scale-95 focus:outline-none rounded-lg shadow-none"
          onClick={handleCloseClick}
        >
          <img
            className="w-full h-full pointer-events-none"
            alt="Close button"
            src="/Close button.png"
          />
        </Button>

        {/* 开始按钮 - 严格按照 project 位置 */}
        <Button 
          className="absolute w-[110px] h-[51px] top-[520px] left-[383px] p-0 bg-transparent hover:bg-transparent cursor-pointer transition-all duration-200 hover:scale-105 hover:brightness-110 active:scale-95 focus:outline-none rounded-lg shadow-none"
          onClick={handleStartClick}
        >
          <img
            className="w-full h-full pointer-events-none"
            alt="Start button"
            src="/Button_Start.png"
          />
        </Button>

        {/* 标题图片 - 严格按照 project 位置 */}
        <div className="absolute w-[412px] top-3 left-[135px]">
          <img
            className="w-full h-auto object-contain"
            alt="Drag your cat onto the map"
            src="/Title_ChooseYouCat.png"
            onError={(e) => {
              // 如果图片加载失败，显示文字标题作为备用
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const textElement = target.nextElementSibling as HTMLElement;
              if (textElement) {
                textElement.style.display = 'block';
              }
            }}
          />
          {/* 备用文字标题 */}
          <h1 
            className="hidden text-[#f0bc08] text-[38px] font-normal text-center leading-[30px] tracking-[0]"
            style={{ 
              fontFamily: "'Silkscreen', Helvetica, monospace",
              WebkitTextStroke: "3px #000000"
            }}
          >
            DRAG YOUR CAT ONTO THE MAP
          </h1>
        </div>
      </div>

      {/* 全局拖拽中的猫咪 */}
      {dragState.isDragging && dragState.draggedCat && (
        <div
          className="fixed pointer-events-none z-[9999] will-change-transform"
          style={{
            top: `${mousePosition.y - dragState.offsetY}px`,
            left: `${mousePosition.x - dragState.offsetX}px`,
          }}
        >
          <img
            className="w-12 h-12 object-cover opacity-80 pointer-events-none"
            alt={dragState.draggedCat.alt}
            src={dragState.draggedCat.src}
            draggable={false}
          />
        </div>
      )}
    </div>
  );

};


