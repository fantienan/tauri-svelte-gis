import { nanoid } from 'nanoid';
import { type IDanmakuImage, genRandomInt, type IDanmakuOptions } from '@/components';

export type IGenDanmakus = {
  fixedNum?: number;
  scrollNum?: number;
  seniorNum?: number;
  specialNum?: number;
  danmakuImages: IDanmakuImage[];
};

let _t = 0;
const genRandomTime = (t: number, speed: number = 500) => {
  _t += speed;
  return t + _t;
};
/**
 * 获取弹幕相关数据
 */
export async function genDanmakus(config: IGenDanmakus) {
  const { fixedNum = 0, scrollNum = 0, seniorNum = 0, danmakuImages } = config;
  let time = Date.now();
  time += 1000 * 4;

  const textSections = [
    `读书不觉已春深`,
    `一寸光阴一寸金`,
    `不是道人来引笑`,
    `周情孔思正追寻`,
    `浮云一百八盘萦，落日四十八渡明。`,
    `得即高歌失即休，多愁多恨亦悠悠。`,
    `今朝有酒今朝醉，明日愁来明日愁。`,
    `生民何计乐樵苏。`,
    `待到秋来九月八，我花开后百花杀。`,
    `侯门一入深似海，从此萧郎是路人。`,
    `崆峒访道至湘湖，万卷诗书看转愚。`,
    `手帕蘑菇及线香，本资民用反为殃。`,
    `清风两袖朝天去，免得闾阎话短长。`,
    `春风得意马蹄疾，一日看尽长安花。`,
    `残灯无焰影幢幢，此夕闻君谪九江。`,
    `垂死病中惊坐起，暗风吹雨入寒窗。`,
    `新年快乐`,
    `更好的一年`,
    `继续努力`,
    `这泰裤辣`,
    `恭喜发财`
  ];

  // const blessingTextSections = [
  //   `新年快乐`,
  //   `灯笼起飞`,
  //   `不错`,
  //   `妙啊`,
  //   `希望所有人都梦想成真`,
  //   `阖家欢乐`,
  //   `太棒啦`,
  //   `前途似锦`,
  //   `考上好的大学`,
  //   `恭喜发财`,
  // ];

  const colors = [
    '#FFFFFF',
    '#FE0302',
    '#FF7204',
    '#FFAA02',
    '#FFD302',
    '#FFFF00',
    '#A0EE00',
    '#00CD00',
    '#019899',
    '#4266BE',
    '#89D5FF',
    '#CC0273'
  ];

  // 弹幕数据
  const danmakus: IDanmakuOptions[] = [];

  // 自动生成固定弹幕
  for (let i = 0; i < fixedNum; i++) {
    danmakus.push({
      id: nanoid(),
      danmakuType: i % 2 === 1 ? 'top' : 'bottom',
      time: genRandomTime(time, 500),
      text:
        `[${danmakuImages[Math.floor(Math.random() * danmakuImages.length)].id}]` +
        textSections[Math.floor(Math.random() * textSections.length)] +
        `[${danmakuImages[Math.floor(Math.random() * danmakuImages.length)].id}]`,
      fontSize: Math.random() < 0.1 ? 24 : 34,
      lineHeight: 1.1,
      color: colors[Math.floor(Math.random() * colors.length)],
      duration: 6
    });
  }

  // 自动生成滚动弹幕
  for (let i = 1; i < scrollNum; i++) {
    danmakus.push({
      id: nanoid(),
      danmakuType: 'scroll',
      time: genRandomTime(time, 500),
      text:
        `[${danmakuImages[Math.floor(Math.random() * danmakuImages.length)].id}]` +
        textSections[Math.floor(Math.random() * textSections.length)] +
        `[${danmakuImages[Math.floor(Math.random() * danmakuImages.length)].id}]`,
      // text: textSections[Math.floor(Math.random() * textSections.length)],
      // fontSize: Math.random() < 0.1 ? 24 : 34,
      lineHeight: 1.2,
      color: colors[Math.floor(Math.random() * colors.length)]
    });
  }

  // 自动生成高级弹幕
  for (let i = 0; i < seniorNum; i++) {
    danmakus.push({
      id: nanoid(),
      danmakuType: 'scroll',
      // danmakuType: 'senior',
      time: Math.random() * 211 * 1000,
      text:
        `[${danmakuImages[Math.floor(Math.random() * danmakuImages.length)].id}]` +
        textSections[Math.floor(Math.random() * textSections.length)] +
        `[${danmakuImages[Math.floor(Math.random() * danmakuImages.length)].id}]`,
      fontSize: genRandomInt(20, 50),
      lineHeight: 1.1,
      color: colors[Math.floor(Math.random() * colors.length)]
    });
  }
  danmakus.unshift({
    id: 'interanl',
    text: '[0005]一大波弹幕即将来袭[0008]',
    prior: true,
    time: genRandomTime(time, 500),
    danmakuType: 'scroll',
    fontSize: 16
  });
  return danmakus;
}
