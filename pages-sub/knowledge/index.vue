<template>
  <view class="page-container">
    <!-- 文章头部 -->
    <view class="article-header">
      <text class="article-icon">{{ article.icon }}</text>
      <text class="article-title">{{ article.title }}</text>
      <view class="article-meta">
        <text class="meta-tag">{{ article.category }}</text>
        <text class="meta-views">{{ article.views }}人看过</text>
      </view>
    </view>

    <!-- 文章内容 -->
    <view class="article-body card">
      <view class="content-section" v-for="(section, idx) in article.sections" :key="idx">
        <text class="section-title" v-if="section.title">{{ section.title }}</text>
        <text class="section-text">{{ section.text }}</text>
        <view class="section-list" v-if="section.list">
          <view class="list-item" v-for="(item, i) in section.list" :key="i">
            <text class="list-bullet">{{ item.icon || '•' }}</text>
            <text class="list-text">{{ item.text }}</text>
          </view>
        </view>
        <view class="section-tip" v-if="section.tip">
          <text class="tip-icon">💡</text>
          <text class="tip-text">{{ section.tip }}</text>
        </view>
        <view class="section-warning" v-if="section.warning">
          <text class="warning-icon">⚠️</text>
          <text class="warning-text">{{ section.warning }}</text>
        </view>
      </view>
    </view>

    <!-- 相关推荐 -->
    <view class="related card">
      <text class="related-title">📖 相关推荐</text>
      <view class="related-list">
        <view class="related-item" v-for="item in relatedArticles" :key="item.id" @tap="openArticle(item)">
          <text class="related-icon">{{ item.icon }}</text>
          <text class="related-name">{{ item.title }}</text>
          <text class="related-arrow">›</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
const ARTICLES = {
  'menstrual-health': {
    icon: '🩸', title: '经期卫生知识全解', category: '健康科普', views: 12580,
    sections: [
      { title: '一、什么是正常月经？', text: '正常月经周期为21-35天，平均28天。每次经期持续2-7天，平均4-6天。经血总量约20-80ml，颜色从鲜红到暗红都属于正常范围。月经受激素调控，是女性生殖系统健康的重要标志。' },
      { title: '二、经期卫生要点', list: [
        { icon: '🔄', text: '卫生巾建议每2-3小时更换一次，量少时也不要超过4小时' },
        { icon: '🚿', text: '每天用温水清洗外阴，不要使用阴道冲洗液，会破坏阴道自净能力' },
        { icon: '👔', text: '选择纯棉、透气的内裤，避免紧身裤和化纤材质' },
        { icon: '🛁', text: '经期可以洗澡，建议淋浴而非盆浴，水温不宜过热' },
        { icon: '😴', text: '保证充足睡眠，每晚7-8小时，有助于激素平衡' }
      ]},
      { title: '三、经期常见误区', text: '❌ 误区一：经期不能洗头。实际上可以洗，但要注意及时吹干，避免受凉。\n❌ 误区二：经期不能运动。适度运动反而有助于缓解痛经和改善情绪。\n❌ 误区三：经期吃不胖。经期新陈代谢略有变化，但不会"吃不胖"。\n❌ 误区四：经血是"脏血"。经血是子宫内膜脱落的正常生理现象，不脏。', tip: '记录每次月经的开始日期、持续天数和流量变化，有助于了解自己的周期规律。' },
      { title: '四、什么时候需要就医？', list: [
        { icon: '🔴', text: '月经量突然明显增多或减少' },
        { icon: '🔴', text: '周期突然变得非常不规律' },
        { icon: '🔴', text: '经期超过7天仍未结束' },
        { icon: '🔴', text: '痛经严重影响日常生活和工作' },
        { icon: '🔴', text: '经间期出血或同房后出血' },
        { icon: '🔴', text: '闭经超过3个月（排除怀孕）' }
      ], warning: '以上情况可能提示子宫肌瘤、子宫内膜异位症、多囊卵巢综合征等疾病，建议尽早就诊妇科。' }
    ]
  },
  'diet-guide': {
    icon: '🥗', title: '经期饮食指南', category: '饮食营养', views: 9870,
    sections: [
      { title: '一、经期为什么要特别注意饮食？', text: '经期身体会流失血液和铁质，同时激素波动会影响消化系统和食欲。合理的饮食不仅能补充营养、缓解不适，还能帮助身体更快恢复。' },
      { title: '二、推荐食物', list: [
        { icon: '🫖', text: '红糖姜茶 — 温经散寒，促进血液循环，缓解痛经' },
        { icon: '🥩', text: '红肉（牛肉、瘦猪肉）— 富含血红素铁，补充经期流失的铁质' },
        { icon: '🥬', text: '深绿色蔬菜（菠菜、西兰花）— 含铁和叶酸，帮助造血' },
        { icon: '🥜', text: '坚果（核桃、杏仁）— 含维生素E和镁，缓解经前综合征' },
        { icon: '🐟', text: '深海鱼（三文鱼、金枪鱼）— 富含Omega-3，减轻炎症和痛经' },
        { icon: '🍌', text: '香蕉 — 富含钾和维生素B6，缓解腹胀和情绪波动' },
        { icon: '🍫', text: '黑巧克力（70%以上）— 含镁，改善情绪，但要适量' },
        { icon: '🥚', text: '鸡蛋 — 优质蛋白质和维生素D，支持激素合成' }
      ]},
      { title: '三、应该避免的食物', list: [
        { icon: '🚫', text: '冰冷饮品和食物 — 导致血管收缩，加重痛经' },
        { icon: '🚫', text: '辛辣刺激食物 — 可能加重盆腔充血和不适' },
        { icon: '🚫', text: '浓茶和咖啡 — 咖啡因会加重焦虑和乳房胀痛' },
        { icon: '🚫', text: '高盐食物 — 导致水钠潴留，加重水肿和腹胀' },
        { icon: '🚫', text: '酒精 — 影响肝脏代谢雌激素，可能加重经前症状' }
      ], tip: '经期前一周就开始注意饮食调整，效果会更好。' },
      { title: '四、经期不同阶段的饮食重点', text: '📅 经期前：多吃富含维生素B6的食物（如香蕉、鸡肉），缓解经前综合征。\n📅 经期中：重点补铁补血，多吃红肉和深绿色蔬菜，喝温热饮品。\n📅 经期后：补充蛋白质和维生素C（如橙子、猕猴桃），帮助身体恢复和铁的吸收。' }
    ]
  },
  'exercise-guide': {
    icon: '🏃‍♀️', title: '经期运动完全指南', category: '运动健身', views: 7650,
    sections: [
      { title: '一、经期可以运动吗？', text: '答案是：可以！适度运动不仅不会伤害身体，反而有诸多好处。运动能促进血液循环、释放内啡肽（天然止痛物质）、改善情绪。关键是要选对运动类型和强度。' },
      { title: '二、推荐运动', list: [
        { icon: '✅', text: '散步 — 最简单的有氧运动，每次20-30分钟' },
        { icon: '✅', text: '轻柔瑜伽 — 婴儿式、猫牛式、仰卧束角式特别适合' },
        { icon: '✅', text: '拉伸运动 — 缓解腰酸背痛，放松肌肉' },
        { icon: '✅', text: '游泳（使用棉条）— 水的浮力减轻身体负担' },
        { icon: '✅', text: '骑固定自行车 — 低冲击有氧，强度可控' }
      ]},
      { title: '三、应该避免的运动', list: [
        { icon: '❌', text: 'HIIT、跑步等高强度运动 — 加重疲劳和出血量' },
        { icon: '❌', text: '腹部力量训练 — 增加腹压，可能加重不适' },
        { icon: '❌', text: '倒立体式 — 可能影响经血正常排出' },
        { icon: '❌', text: '长时间剧烈运动 — 消耗过大，不利于恢复' }
      ], warning: '如果痛经严重、出血量大或感到明显不适，请以休息为主，不要勉强运动。' },
      { title: '四、经期各阶段运动建议', text: '📅 第1-2天（量多期）：以轻柔拉伸和散步为主，时间控制在15-20分钟。\n📅 第3-4天（量减期）：可以尝试轻度瑜伽或慢走，时间可延长到30分钟。\n📅 第5天以后（收尾期）：基本可以恢复正常运动，但注意不要突然增加强度。', tip: '运动前后注意保暖，运动后及时更换卫生巾。多补充水分。' }
    ]
  },
  'pregnancy-prep': {
    icon: '🤰', title: '备孕完全攻略', category: '备孕知识', views: 15430,
    sections: [
      { title: '一、备孕前的准备', text: '建议提前3-6个月开始备孕准备。这个时间足够让身体调整到最佳状态。' },
      { title: '二、孕前检查清单', list: [
        { icon: '🏥', text: '常规体检 — 血常规、尿常规、肝肾功能' },
        { icon: '🩸', text: '妇科检查 — B超、宫颈TCT、白带常规' },
        { icon: '🧬', text: '优生五项 — TORCH检查（弓形虫、风疹等）' },
        { icon: '💉', text: '甲状腺功能 — 甲减/甲亢都会影响受孕和胎儿发育' },
        { icon: '🦷', text: '口腔检查 — 孕期牙病治疗受限，提前处理' },
        { icon: '👨', text: '男方检查 — 精液常规分析' }
      ]},
      { title: '三、抓住排卵期', text: '排卵期是受孕的最佳时机。对于月经规律的女性：\n\n📅 排卵日 = 下次月经第一天 - 14天\n📅 易孕期 = 排卵日前5天到后1天\n\n例如：28天周期，月经第1天是1号\n→ 排卵日约在第14天（14号）\n→ 易孕期为9号-15号\n\n在这个时间段内，建议每1-2天同房一次。', tip: '可以使用排卵试纸（LH试纸）更精准地检测排卵。当试纸出现强阳性后24-48小时内会排卵。' },
      { title: '四、生活调整', list: [
        { icon: '💊', text: '提前3个月开始补充叶酸（0.4mg/天），预防胎儿神经管缺陷' },
        { icon: '🚭', text: '戒烟戒酒，包括二手烟' },
        { icon: '☕', text: '减少咖啡因摄入（每天不超过200mg）' },
        { icon: '😴', text: '规律作息，保证7-8小时睡眠' },
        { icon: '🏃‍♀️', text: '适度运动，保持健康体重（BMI 18.5-24）' },
        { icon: '😊', text: '保持心情愉快，压力过大会影响排卵' }
      ], warning: '如果备孕超过12个月未成功（35岁以上为6个月），建议到生殖中心做进一步检查。' }
    ]
  },
  'pain-relief': {
    icon: '🩹', title: '痛经缓解全攻略', category: '症状缓解', views: 18920,
    sections: [
      { title: '一、了解痛经', text: '痛经分为两种：\n\n📌 原发性痛经：生殖器官无器质性病变，多见于青春期到25岁左右，通常随年龄增长或生育后减轻。\n📌 继发性痛经：由子宫内膜异位症、子宫肌瘤等疾病引起，需要就医治疗。\n\n约80%的痛经属于原发性痛经。' },
      { title: '二、物理缓解方法', list: [
        { icon: '🔥', text: '热敷 — 用热水袋或暖宝宝敷在小腹部，温度40-45°C，每次15-20分钟' },
        { icon: '💆', text: '按摩 — 顺时针轻柔按摩小腹，或按压合谷穴（虎口处）' },
        { icon: '🧘', text: '瑜伽 — 婴儿式、猫牛式可以放松腹部肌肉' },
        { icon: '🛁', text: '热水泡脚 — 促进全身血液循环，水温38-42°C' },
        { icon: '🎵', text: '听音乐放松 — 转移注意力，缓解紧张情绪' }
      ]},
      { title: '三、药物缓解', list: [
        { icon: '💊', text: '布洛芬（如芬必得）— 最常用的止痛药，在痛感初期服用效果最好，每次200-400mg' },
        { icon: '💊', text: '对乙酰氨基酚（如泰诺林）— 温和止痛，胃肠道反应较小' },
        { icon: '💊', text: '萘普生 — 另一种有效的NSAIDs类止痛药' }
      ], tip: '止痛药在月经开始前1天或刚开始痛时服用效果最佳，不要等到痛得受不了才吃。按说明书剂量服用，短期使用是安全的，不会产生依赖。' },
      { title: '四、饮食调理', text: '✅ 推荐：红糖姜茶、温热食物、深海鱼（Omega-3抗炎）、富含镁的食物（香蕉、坚果）\n\n❌ 避免：冰冷食物、咖啡因、高盐食物、酒精' },
      { title: '五、什么时候必须就医？', list: [
        { icon: '🚨', text: '止痛药无效，疼痛越来越严重' },
        { icon: '🚨', text: '痛经伴有大量血块或异常出血' },
        { icon: '🚨', text: '非经期也出现盆腔疼痛' },
        { icon: '🚨', text: '痛经伴有发热、异常分泌物' },
        { icon: '🚨', text: '25岁以后痛经反而加重' }
      ], warning: '以上情况可能是子宫内膜异位症、子宫腺肌症等疾病的信号，需要做B超和妇科检查来明确诊断。' }
    ]
  },
  'sleep-improve': {
    icon: '😴', title: '经期如何睡个好觉', category: '生活调理', views: 5430,
    sections: [
      { title: '一、为什么经期容易失眠？', text: '经期失眠很常见，主要原因有：\n\n📌 激素波动：经前孕酮下降会影响睡眠质量\n📌 痛经不适：腹痛、腰酸让人难以入睡\n📌 情绪波动：焦虑、烦躁影响入睡\n📌 夜间担心：害怕侧漏导致睡眠不安稳' },
      { title: '二、改善睡眠的方法', list: [
        { icon: '🌡️', text: '睡前热水泡脚15分钟，或喝一杯温热的牛奶' },
        { icon: '📱', text: '睡前1小时远离手机屏幕，蓝光会抑制褪黑素分泌' },
        { icon: '🧘', text: '做5-10分钟的深呼吸或冥想，放松身心' },
        { icon: '🛏️', text: '使用夜用加长卫生巾或安心裤，减少侧漏焦虑' },
        { icon: '🎵', text: '听白噪音或轻柔音乐，帮助入睡' },
        { icon: '🧊', text: '保持卧室凉爽（18-22°C），盖舒适的被子' }
      ], tip: '经期可以适当调整睡姿，侧卧位并将膝盖微微弯曲，可以减轻腹部压力。' },
      { title: '三、什么时候需要关注？', text: '如果经期失眠严重影响到白天的工作和生活，或者经前失眠持续超过一周，可以考虑：\n\n• 记录睡眠日记，观察是否与周期规律相关\n• 咨询医生是否需要短期使用助眠药物\n• 检查是否有经前焦虑症（PMDD）' }
    ]
  }
}

export default {
  data() {
    return {
      article: { icon: '', title: '', category: '', views: 0, sections: [] },
      relatedArticles: []
    }
  },
  onLoad(options) {
    const id = options.id || 'menstrual-health'
    this.loadArticle(id)
  },
  methods: {
    loadArticle(id) {
      const data = ARTICLES[id]
      if (data) {
        this.article = data
      } else {
        this.article = ARTICLES['menstrual-health']
      }
      // 相关推荐（排除当前文章）
      this.relatedArticles = Object.entries(ARTICLES)
        .filter(([key]) => key !== id)
        .slice(0, 4)
        .map(([key, val]) => ({ id: key, icon: val.icon, title: val.title }))
    },
    openArticle(item) {
      this.loadArticle(item.id)
      uni.pageScrollTo({ scrollTop: 0, duration: 300 })
    }
  }
}
</script>

<style lang="scss" scoped>
.page-container { min-height:100vh; padding-bottom:40rpx; background:#FFF0F5; }

.article-header { padding:40rpx 32rpx; background:linear-gradient(135deg,#FFE4EF,#F3E8FF); margin-bottom:24rpx; }
.article-icon { font-size:64rpx; display:block; margin-bottom:16rpx; }
.article-title { font-size:38rpx; font-weight:700; color:#333; display:block; margin-bottom:16rpx; }
.article-meta { display:flex; gap:20rpx; align-items:center; }
.meta-tag { font-size:22rpx; color:#FF6B9D; background:#FFF; padding:6rpx 16rpx; border-radius:12rpx; }
.meta-views { font-size:22rpx; color:#999; }

.card { background:#FFF; border-radius:24rpx; padding:32rpx; margin:0 24rpx 24rpx; box-shadow:0 4rpx 20rpx rgba(255,107,157,0.08); }

.content-section { margin-bottom:32rpx; &:last-child{margin-bottom:0;} }
.section-title { font-size:32rpx; font-weight:700; color:#333; display:block; margin-bottom:16rpx; padding-left:16rpx; border-left:6rpx solid #FF6B9D; }
.section-text { font-size:28rpx; color:#555; line-height:1.9; display:block; white-space:pre-wrap; }

.section-list { margin-top:12rpx; }
.list-item { display:flex; align-items:flex-start; gap:12rpx; padding:10rpx 0; }
.list-bullet { font-size:28rpx; flex-shrink:0; margin-top:2rpx; }
.list-text { font-size:27rpx; color:#555; line-height:1.7; }

.section-tip { display:flex; align-items:flex-start; gap:12rpx; padding:20rpx; background:#FFF5F0; border-radius:16rpx; margin-top:16rpx; }
.tip-icon { font-size:28rpx; flex-shrink:0; }
.tip-text { font-size:26rpx; color:#E67E22; line-height:1.7; }

.section-warning { display:flex; align-items:flex-start; gap:12rpx; padding:20rpx; background:#FFF5F5; border-radius:16rpx; margin-top:16rpx; }
.warning-icon { font-size:28rpx; flex-shrink:0; }
.warning-text { font-size:26rpx; color:#E74C3C; line-height:1.7; }

.related { margin-bottom:0; }
.related-title { font-size:30rpx; font-weight:700; color:#333; display:block; margin-bottom:20rpx; }
.related-list { display:flex; flex-direction:column; }
.related-item { display:flex; align-items:center; padding:18rpx 0; border-bottom:1rpx solid #FFF0F5; &:last-child{border-bottom:none;} &:active{background:#FFF5F8;} }
.related-icon { font-size:32rpx; margin-right:16rpx; }
.related-name { flex:1; font-size:28rpx; color:#333; }
.related-arrow { font-size:32rpx; color:#CCC; }
</style>
