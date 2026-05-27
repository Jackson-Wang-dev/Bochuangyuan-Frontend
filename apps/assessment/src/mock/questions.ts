// TODO: replace with API call to fetch question bank from DB (GET /assessment/questions)
import type { Question } from '../types'

export const questions: Question[] = [
  {
    id: 1,
    sequence: 1,
    sceneTitle: '深夜的微信',
    sceneDescription:
      '在某个周三晚上 11 点，你倒在沙发上。手机屏幕亮了，是前同事老王发来的消息。他说他不在乎约你发呆，有个想法想找你聊聊。你盯着那句"有个想法"，好一会儿没有回。',
    questionText: '你脑海里第一个念头是什么？',
    options: [
      {
        id: 11,
        label: 'A',
        content: '终于来了，我等这种机会很久了。',
        scores: { risk_appetite: 3, execution: 2 },
      },
      {
        id: 12,
        label: 'B',
        content: '仔细听听，这不是一个不错的方向吗。',
        scores: { business_acumen: 3, resource_integration: 2 },
      },
      {
        id: 13,
        label: 'C',
        content: '这么晚了，他一定是遇到很认真的事了。',
        scores: { stress_resistance: 2, resource_integration: 2 },
      },
      {
        id: 14,
        label: 'D',
        content: '不会先要明白主旨吧，明天还要上班呢。',
        scores: { execution: 2, innovation: 1 },
      },
    ],
  },
  {
    id: 2,
    sequence: 2,
    sceneTitle: '听完计划之后',
    sceneDescription:
      '周末你们见了面。老王滔滔不绝讲了一个小时——一个你从没有想过的细分市场，切入点特别，有一点未知，也有一点未完成感。你手里捏着已经凉掉的大杯美式。',
    questionText: '那一刻，你心里在想什么？',
    options: [
      {
        id: 21,
        label: 'A',
        content: '这个模式如果改一改，可以做成更大的东西。',
        scores: { innovation: 3, business_acumen: 2 },
      },
      {
        id: 22,
        label: 'B',
        content: '我需要知道具体要花多少钱、多久能回本。',
        scores: { business_acumen: 3, risk_appetite: 1 },
      },
      {
        id: 23,
        label: 'C',
        content: '老王这个人靠谱，跟他干应该没问题。',
        scores: { resource_integration: 3, stress_resistance: 1 },
      },
      {
        id: 24,
        label: 'D',
        content: '我现在就可以开干，先找个周末做个原型验证一下。',
        scores: { execution: 3, innovation: 1 },
      },
    ],
  },
  {
    id: 3,
    sequence: 3,
    sceneTitle: '要不要辞职',
    sceneDescription:
      '连续三天，你不管在做什么，脑子里都在转那个计划。吃饭的时候，你划掉了预算里的"旅行基金"。抬头看到电话你都没来接。今年年底还有两个月就要打年终奖了。',
    questionText: '你心里的天平在怎么摆？',
    options: [
      {
        id: 31,
        label: 'A',
        content: '机会不等人，年纪只有这个窗口，要跳就现在。',
        scores: { risk_appetite: 3, execution: 2 },
      },
      {
        id: 32,
        label: 'B',
        content: '能不能先兼顾着干，两边都稳一稳再说？',
        scores: { risk_appetite: 1, resource_integration: 2 },
      },
      {
        id: 33,
        label: 'C',
        content: '我需要先跟家人商量一下，不能只靠自己扛。',
        scores: { stress_resistance: 3, resource_integration: 1 },
      },
      {
        id: 34,
        label: 'D',
        content: '先观察一个月，看看老王是否真有认真的准备。',
        scores: { business_acumen: 3, stress_resistance: 1 },
      },
    ],
  },
  {
    id: 4,
    sequence: 4,
    sceneTitle: '启动资金缺口',
    sceneDescription:
      '你们算了一笔账，启动需要 40 万。老王出 20 万，你出 10 万，还差 10 万。白板上的数字盯着你们。',
    questionText: '那一瞬间，你冒出来的念头是？',
    options: [
      {
        id: 41,
        label: 'A',
        content: '我可以找两个朋友来凑，他们一直有意思想投点东西。',
        scores: { resource_integration: 3, risk_appetite: 2 },
      },
      {
        id: 42,
        label: 'B',
        content: '砍一砍功能，用最低成本跑通第一个闭环再说。',
        scores: { execution: 3, business_acumen: 2 },
      },
      {
        id: 43,
        label: 'C',
        content: '10 万缺口而已，我可以垫，不能在最开始就缩。',
        scores: { risk_appetite: 3, stress_resistance: 2 },
      },
      {
        id: 44,
        label: 'D',
        content: '也许我们可以换一个不需要启动资金的模式。',
        scores: { innovation: 3, business_acumen: 1 },
      },
    ],
  },
  {
    id: 5,
    sequence: 5,
    sceneTitle: '第一次招人',
    sceneDescription:
      '产品框架成了，你们决定招第一个员工。一份简历来自大公司履历不错的前辈，要求薪资高；另一份是小公司出来的，什么都会一点，但履历一般。',
    questionText: '你会选谁？你心里真实的想法是？',
    options: [
      {
        id: 51,
        label: 'A',
        content: '大公司的人能带来资源和背书，钱贵但值得。',
        scores: { resource_integration: 3, business_acumen: 2 },
      },
      {
        id: 52,
        label: 'B',
        content: '小公司出来的更能扛事，我们要的是能打仗的人。',
        scores: { stress_resistance: 3, execution: 2 },
      },
      {
        id: 53,
        label: 'C',
        content: '能不能两个都要，反正先面试完再定嘛。',
        scores: { risk_appetite: 2, resource_integration: 2 },
      },
      {
        id: 54,
        label: 'D',
        content: '不如换个思路，先用实习生加外包把核心功能跑起来验证。',
        scores: { innovation: 2, execution: 2 },
      },
    ],
  },
  {
    id: 6,
    sequence: 6,
    sceneTitle: '产品上线后的真相',
    sceneDescription:
      '产品上线了。你们预期第一个月 500 个用户，实际来了 47 个。老王看着数据什么都没说，有人已经在算桌面上的数字。你看着那 47 个数字，眼神空了一会儿。',
    questionText: '此刻你心里闪过的念头是什么？',
    options: [
      {
        id: 61,
        label: 'A',
        content: '47 个用户的反馈里一定藏着密码，马上联系他们问问。',
        scores: { execution: 3, innovation: 1 },
      },
      {
        id: 62,
        label: 'B',
        content: '我们是不是找错渠道了，换一批人群再试一次。',
        scores: { business_acumen: 3, resource_integration: 2 },
      },
      {
        id: 63,
        label: 'C',
        content: '这太正常了，每个产品都要经过这个阶段，继续走。',
        scores: { stress_resistance: 3, risk_appetite: 2 },
      },
      {
        id: 64,
        label: 'D',
        content: '也许我们的产品形态从根本上就找错了。',
        scores: { innovation: 3, business_acumen: 2 },
      },
    ],
  },
  {
    id: 7,
    sequence: 7,
    sceneTitle: '合伙人分歧',
    sceneDescription:
      '老王一主张把全部的钱都押在推广上。你觉得应该先把产品问题修好。你们在会议室里争了不知道多久。最后老王的门关上了，你一个人待在外面。',
    questionText: '门关上之后，你心里在想什么？',
    options: [
      {
        id: 71,
        label: 'A',
        content: '我想先找第三方来聊聊，一定有双方都能接受的方案。',
        scores: { resource_integration: 3, stress_resistance: 2 },
      },
      {
        id: 72,
        label: 'B',
        content: '如果事实最终证明他是对的，我愿意低头认错。',
        scores: { stress_resistance: 3, business_acumen: 1 },
      },
      {
        id: 73,
        label: 'C',
        content: '不行，这个产品方向是对的，我不能让它走偏。',
        scores: { execution: 3, innovation: 2 },
      },
      {
        id: 74,
        label: 'D',
        content: '如果我们内讧了，这一场仗是不是就白费了。',
        scores: { stress_resistance: 2, risk_appetite: 1 },
      },
    ],
  },
  {
    id: 8,
    sequence: 8,
    sceneTitle: '深夜的崩溃时刻',
    sceneDescription:
      '凌晨两点，你还在公司。银行账户只剩够发最后一个月工资的钱。老王一天没来，你的伙伴去找他借调了事。你看着窗外的路灯，灯下一个人都没有。',
    questionText: '你从最深处冒出来的念头是什么？',
    options: [
      {
        id: 81,
        label: 'A',
        content: '如果我一个人也能撑过去，前面就没什么是扛不住的。',
        scores: { stress_resistance: 3, execution: 2 },
      },
      {
        id: 82,
        label: 'B',
        content: '当初选择出来，就是因为不想过那种一眼到头的生活。',
        scores: { risk_appetite: 3, innovation: 1 },
      },
      {
        id: 83,
        label: 'C',
        content: '明天必须找到老王，不能乱，我把问题一件件拆出来解决。',
        scores: { execution: 3, resource_integration: 1 },
      },
      {
        id: 84,
        label: 'D',
        content: '也许该考虑转路了，看一下手头的钱能让大家有个好结局。',
        scores: { business_acumen: 3, stress_resistance: 1 },
      },
    ],
  },
  {
    id: 9,
    sequence: 9,
    sceneTitle: '意外的收购邀约',
    sceneDescription:
      '一个行业里的中型公司找到你们，说愿意出 300 万收购。300 万，你们两个人各分一半，是你三年工资的总和。老王看着你，等你表态。',
    questionText: '你的第一反应是什么？',
    options: [
      {
        id: 91,
        label: 'A',
        content: '300 万？我们的价值远不止这个数。',
        scores: { business_acumen: 3, risk_appetite: 2 },
      },
      {
        id: 92,
        label: 'B',
        content: '如果我们卖了，总算可以睡个好觉了。',
        scores: { stress_resistance: 3, execution: 1 },
      },
      {
        id: 93,
        label: 'C',
        content: '能不能谈战略合作，不要收购，我们各退一步？',
        scores: { resource_integration: 3, business_acumen: 2 },
      },
      {
        id: 94,
        label: 'D',
        content: '如果我们这次卖了，下一次是什么时候，是什么？',
        scores: { innovation: 3, risk_appetite: 2 },
      },
    ],
  },
  {
    id: 10,
    sequence: 10,
    sceneTitle: '回望时刻',
    sceneDescription:
      '一年过去了。你坐在新的办公室里，窗外是真实的城市。你忽然想起那个深夜路灯下孤独的自己。你给一年前的自己发了一条信息。',
    questionText: '那条信息的内容是什么？',
    options: [
      {
        id: 101,
        label: 'A',
        content: '别慌，你选的方向是对的。',
        scores: { execution: 2, innovation: 2 },
      },
      {
        id: 102,
        label: 'B',
        content: '谢谢你在那个时候还是迈出了那一步。',
        scores: { risk_appetite: 2, stress_resistance: 2 },
      },
      {
        id: 103,
        label: 'C',
        content: '别太相信老王，早点建立自己的团队。',
        scores: { resource_integration: 3, business_acumen: 2 },
      },
      {
        id: 104,
        label: 'D',
        content: '享受那段迷茫吧，结果没那么重要。',
        scores: { stress_resistance: 3, innovation: 1 },
      },
    ],
  },
]
