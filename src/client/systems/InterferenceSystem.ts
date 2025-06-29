/**
 * 干扰系统 - 负责游戏干扰事件的生成和管理
 * Interference System - Handles game interference events generation and management
 * 
 * @author 开发者A - 游戏核心逻辑负责人
 */

import { InterferenceEvent, InterferenceType, GameConfig } from '../types/GameTypes';

export class InterferenceSystem {
  private config: GameConfig;

  constructor(config: GameConfig) {
    this.config = config;
  }

  /**
   * 生成随机干扰间隔时间
   * Generate random interference interval
   */
  generateRandomInterferenceInterval(): number {
    return Math.random() * 
      (this.config.INTERFERENCE_MAX_INTERVAL - this.config.INTERFERENCE_MIN_INTERVAL) + 
      this.config.INTERFERENCE_MIN_INTERVAL;
  }

  /**
   * 获取随机干扰类型
   * Get random interference type
   */
  getRandomInterferenceType(): InterferenceType {
    const types: InterferenceType[] = [
      'bubble_time',
      'cold_wind', 
      'controls_reversed', 
      'electric_leakage',
      'surprise_drop'
    ];
    const randomIndex = Math.floor(Math.random() * types.length);
    const selectedType = types[randomIndex] || 'controls_reversed'; // Fallback to ensure valid type
    return selectedType;
  }

  /**
   * 创建新的干扰事件
   * Create new interference event
   */
  createInterferenceEvent(type: InterferenceType): InterferenceEvent {
    // Controls reversed has a fixed 5-second duration, others use config duration
    let duration: number;
    if (type === 'controls_reversed') {
      duration = 5;
    } else {
      duration = this.config.INTERFERENCE_DURATION;
    }
    
    return {
      type,
      isActive: true,
      duration,
      remainingTime: duration,
    };
  }

  /**
   * 清除干扰事件
   * Clear interference event
   */
  clearInterferenceEvent(): InterferenceEvent {
    return {
      type: 'none',
      isActive: false,
      duration: 0,
      remainingTime: 0,
    };
  }

  /**
   * 应用干扰效果到目标温度
   * Apply interference effects to target temperature
   */
  applyTemperatureShock(): number {
    // 温度冲击：设置具有挑战性但不极端的目标温度
    // Temperature shock: Set challenging but not extreme target temperatures
    // 避免0.1和0.9这样的极端值，改为0.2和0.8，保持游戏可玩性
    return Math.random() > 0.5 ? 0.8 : 0.2;
  }

  /**
   * 获取干扰事件的显示内容
   * Get interference event display content
   */
  getInterferenceContent(type: InterferenceType) {
    switch (type) {
      case 'bubble_time':
        return {
          icon: '🫧',
          title: 'Bubble Time!',
          description: 'Bubbles are everywhere!',
          bgColor: 'bg-blue-500',
        };
      case 'cold_wind':
        return {
          icon: '🌨️',
          title: 'Cold Wind Incoming!',
          description: 'A cold wind is affecting the temperature!',
          bgColor: 'bg-cyan-500',
        };
      case 'controls_reversed':
        return {
          icon: '🔄',
          title: 'Controls Reversed!',
          description: 'The + and - buttons are swapped!',
          bgColor: 'bg-purple-500',
        };
      case 'electric_leakage':
        return {
          icon: '⚡',
          title: 'Electric Leakage!',
          description: 'Warning! Electric leakage detected!',
          bgColor: 'bg-yellow-500',
        };
      case 'surprise_drop':
        return {
          icon: '🎁',
          title: 'Surprise Drop!',
          description: 'Something unexpected has happened!',
          bgColor: 'bg-pink-500',
        };
      default:
        return {
          icon: '⚠️',
          title: 'Interference!',
          description: 'Something is wrong!',
          bgColor: 'bg-red-500',
        };
    }
  }

  /**
   * 检查是否应该触发干扰事件
   * Check if interference event should be triggered
   */
  shouldTriggerInterference(
    interferenceTimer: number,
    isInterferenceActive: boolean
  ): boolean {
    return interferenceTimer <= 0 && !isInterferenceActive;
  }

  /**
   * 检查干扰是否可以通过点击中心按钮清除
   * Check if interference can be cleared by clicking center button
   */
  canBeClearedByClick(type: InterferenceType): boolean {
    return type !== 'controls_reversed';
  }
}