import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 在 ES Module 中获取 __dirname 的标准写法
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 读取系统提示词和工具定义（带容错处理）
let systemPrompt = "澄心向导：请以温暖、专业、安全的态度陪伴用户探索内心，不诊断，不替代治疗。";
let tools = [];

try {
  const promptPath = path.join(__dirname, 'prompts', 'system-prompt.md');
  if (fs.existsSync(promptPath)) {
    systemPrompt = fs.readFileSync(promptPath, 'utf-8');
  }
  
  const toolsPath = path.join(__dirname, 'tools', 'functions.json');
  if (fs.existsSync(toolsPath)) {
    tools = JSON.parse(fs.readFileSync(toolsPath, 'utf-8'));
  }
} catch (e) {
  console.warn('⚠️ 未找到 prompts 或 tools 文件，将使用内置默认配置。');
}

// ================= 危机风险评估 =================
const CRISIS_PATTERNS = [
  { level: 'crisis', patterns: [/自杀/, /不想活/, /结束生命/, /自伤/, /割腕/, /跳楼/, /服毒/, /活着没意思/, /没有希望/, /suicide/i, /kill myself/i, /self[- ]?harm/i, /end my life/i, /don't want to live/i] },
  { level: 'high', patterns: [/绝望/, /撑不住/, /崩溃/, /消失/, /伤害自己/, /hopeless/i, /can't go on/i, /worthless/i] },
  { level: 'medium', patterns: [/焦虑/, /抑郁/, /失眠/, /压力/, /痛苦/, /anxious/i, /depressed/i, /insomnia/i, /stress/i] }
];

export function assessRisk(text = '', language = 'zh') {
  for (const item of CRISIS_PATTERNS) {
    if (item.patterns.some(p => p.test(text))) {
      return {
        level: item.level,
        action: item.level === 'crisis' ? '立即启动危机协议：提供热线，询问安全，鼓励联系紧急服务或信任的人。' :
                item.level === 'high' ? '强烈建议专业帮助，制定安全计划，提供资源。' :
                item.level === 'medium' ? '建议预约心理咨询，提供自助资源。' : '继续探索。',
        hotline: (item.level === 'crisis' || item.level === 'high') ? '中国：12356 / 希望24热线 400-161-9995；美国：988；国际：https://findahelpline.com' : ''
      };
    }
  }
  return { level: 'low', action: '继续对话与探索。', hotline: '' };
}

// ================= 资源库 =================
const RESOURCES = {
  zh: {
    hotlines: [
      { name: '全国心理援助热线', number: '12356', note: '24小时' },
      { name: '希望24热线', number: '400-161-9995', note: '24小时' },
      { name: '北京心理危机研究与干预中心', number: '010-82951332', note: '' }
    ],
    books: ['《认知疗法基础与应用》', '《伯恩斯新情绪疗法》', '《依恋与亲密关系》'],
    exercises: ['情绪日记', '思维记录表', '呼吸空间练习', '行为激活']
  },
  en: {
    hotlines: [
      { name: '988 Suicide & Crisis Lifeline', number: '988', note: 'US' },
      { name: 'Samaritans', number: '116 123', note: 'UK' },
      { name: 'Find A Helpline', number: 'https://findahelpline.com', note: 'International' }
    ],
    books: ['Feeling Good', 'Mind Over Mood', 'Attached'],
    exercises: ['Mood diary', 'Thought record', 'Breathing space', 'Behavioral activation']
  }
};

export function getResources(lang = 'zh') { return RESOURCES[lang] || RESOURCES.zh; }

// ================= CBT 认知行为框架 =================
const CBT = {
  cognitiveModel: '情境 → 自动思维 → 情绪 → 行为 → 生理反应',
  beliefHierarchy: '核心信念 → 中间信念（规则/态度/假设）→ 自动思维',
  behavioralAnalysis: '前因 → 行为 → 后果（ABC）',
  defenseMechanisms: ['压抑', '否认', '投射', '合理化', '退行', '升华'],
  attachmentPatterns: ['安全型', '焦虑型', '回避型', '紊乱型']
};

export function getCbtFramework(topic) {
  if (topic && CBT[topic]) return { topic, content: CBT[topic] };
  return CBT;
}

// ================= 内心困境示意图 =================
export function buildStruggleMap({ trigger = '触发事件', thought = '自动化思维', emotion = '情绪', behavior = '行为', consequence = '后果' }) {
  const mermaid = `flowchart LR
A[${trigger}] --> B[${thought}]
B --> C[${emotion}]
C --> D[${behavior}]
D --> E[${consequence}]`;
  return {
    mermaid,
    markdown: `**内心困境示意图**

| 环节 | 内容 |
|---|---|
| 触发事件 | ${trigger} |
| 自动化思维 | ${thought} |
| 情绪 | ${emotion} |
| 行为 | ${behavior} |
| 后果 | ${consequence} |`
  };
}

// ================= 三阶段指导 =================
export function getPhaseGuidance(phase = '1') {
  const map = {
    '1': '建立安全容器：主诉梳理、安全雷达、信任建立。先接住情绪，不急于分析。',
    '2': '深层探索：生命线叙事、信念与归因、行为功能、关系模式。使用苏格拉底提问。',
    '3': '整合反馈：心理教育总结、内心困境示意图、分层建议、必要时转介。'
  };
  return { phase, guidance: map[phase] || map['1'] };
}

// ================= 默认导出（供 DeepSeek Harness 加载） =================
export default {
  name: 'clarity-guide',
  version: '1.0.0',
  systemPrompt,
  tools,
  assessRisk,
  getResources,
  getCbtFramework,
  buildStruggleMap,
  getPhaseGuidance
};