import type { Animal, Blanket, Discovery, Food } from './model';

export const foodNames: Record<Food, string> = {
  apple: '苹果',
  banana: '香蕉',
  bread: '面包',
  strawberry: '草莓',
  carrot: '胡萝卜',
  water: '水壶',
};
export const animalNames: Record<Animal, string> = {
  rabbit: '小兔',
  bear: '小熊',
  squirrel: '小松鼠',
};
export const blanketNames: Record<Blanket, string> = {
  peach: '蜜桃粉',
  sage: '鼠尾草绿',
  lavender: '薰衣草紫',
};
export const blanketColors: Record<Blanket, string> = {
  peach: '#dc9e86',
  sage: '#94aa83',
  lavender: '#b4a4c4',
};
export const discoveryNames: Record<Discovery, string> = {
  butterfly: '蝴蝶',
  frog: '小青蛙',
  acorn: '橡果',
};
export const chapters = [
  {
    label: '装好篮子',
    title: '把今天，装进野餐篮。',
    subtitle: '挑一点喜欢的食物，带上好心情。森林里的朋友正在等你。',
    prompt: '卡布，点一点你想带的食物吧！',
    next: '出发去森林',
  },
  {
    label: '走进森林',
    title: '沿着小路，发现惊喜。',
    subtitle: '慢慢走，仔细听。花丛、池塘和树洞里，会藏着谁呢？',
    prompt: '点点花丛、池塘和树洞，和小伙伴打个招呼吧。',
    next: '去野餐',
  },
  {
    label: '一起野餐',
    title: '好吃的，和朋友一起。',
    subtitle: '铺开小毯子，让每一口分享，都变成一个开心的瞬间。',
    prompt: '先选一样食物，再点一位小动物，就能分享啦。',
    next: '拍张纪念照',
  },
  {
    label: '留下回忆',
    title: '把这一刻，留起来。',
    subtitle: '阳光、朋友，还有你。这是只属于今天的小小纪念。',
    prompt: '咔嚓！谢谢卡布，今天真开心。挥挥手，我们下次再见！',
    next: '再去野餐',
  },
] as const;
