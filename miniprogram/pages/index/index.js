// pages/index/index.js
Page({
  data: {
    todayKnowledge: {
      content: '六堡茶因产于广西苍梧县六堡镇而得名，属于黑茶类。其独特的"槟榔香"是品质鉴别的关键指标，越陈越香。',
      source: '—— 六堡茶百科'
    },
    
    articles: [
      {
        id: 'a1',
        title: '六堡茶的历史渊源',
        type: '历史',
        coverImage: '/miniprogram/images/history.png',
        content: '六堡茶兴于清朝，嘉庆年间成为名茶，远销南洋，被誉为"可以喝的古董"。六堡茶因原产于广西梧州苍梧县六堡镇而得名，至今已有1500多年历史...'
      },
      {
        id: 'a2',
        title: '传统工艺·罨堆发酵',
        type: '工艺',
        coverImage: '/miniprogram/images/craft.png',
        content: '六堡茶核心工艺包含杀青、揉捻、渥堆、陈化，独特的罨堆工艺造就其红浓陈醇的品质特征...'
      },
      {
        id: 'a3',
        title: '六堡茶冲泡技巧',
        type: '冲泡',
        coverImage: '/miniprogram/images/brew.png',
        content: '建议使用紫砂壶或盖碗，沸水润茶，闷泡片刻出汤，第一泡约10秒，后续每泡增加5秒...'
      },
      {
        id: 'a4',
        title: '咏六堡茶诗选',
        type: '茶诗',
        coverImage: '/miniprogram/images/poem.png',
        content: '《咏六堡茶》——六堡香高韵亦长，红浓陈醇味难忘。一壶煮尽千秋事，半盏品来万里香...'
      },
      {
        id: 'a5',
        title: '六堡茶的保健功效',
        type: '养生',
        coverImage: '/miniprogram/images/health.png',
        content: '六堡茶具有祛湿解暑、助消化、降血脂等功效，长期饮用有益健康。尤其适合湿热地区人群饮用...'
      },
      {
        id: 'a6',
        title: '六堡茶的陈化艺术',
        type: '工艺',
        coverImage: '/miniprogram/images/aging.png',
        content: '六堡茶是"可以喝的古董"，陈化是其品质升华的关键过程。经过数年陈化，茶叶口感变得更加醇厚顺滑...'
      },
      {
        id: 'a7',
        title: '六堡茶与茶船古道',
        type: '历史',
        coverImage: '/miniprogram/images/tea_road.png',
        content: '茶船古道是六堡茶外运的重要水路通道。明清时期，六堡茶从合口街码头起运，用竹排或小船沿着六堡河、东安江、贺江，运到西江枢纽重镇——梧州...'
      },
      {
        id: 'a8',
        title: '六堡茶的品鉴技巧',
        type: '冲泡',
        coverImage: '/miniprogram/images/tasting.png',
        content: '品鉴六堡茶主要从四个方面入手：观汤色、闻香气、品滋味、看叶底。好的六堡茶汤色红浓明亮，如琥珀般通透...'
      },
      {
        id: 'a9',
        title: '六堡茶的分类与等级',
        type: '工艺',
        coverImage: '/miniprogram/images/classification.png',
        content: '六堡茶按制作工艺分为传统工艺六堡茶和现代工艺六堡茶。传统工艺采用"罨堆"、"双蒸双压"等方法...'
      },
      {
        id: 'a10',
        title: '六堡茶的储存方法',
        type: '工艺',
        coverImage: '/miniprogram/images/storage.png',
        content: '储存六堡茶要注意"避光、防潮、防异味、通风透气"。最佳储存环境：温度20-30℃，湿度60%-75%...'
      },
      {
        id: 'a11',
        title: '六堡茶名山名寨',
        type: '历史',
        coverImage: '/miniprogram/images/mountains.png',
        content: '六堡茶的核心产区在广西梧州市苍梧县六堡镇，其中以"四柳"最为著名——黑石、恭州、蚕村、大宁...'
      },
      {
        id: 'a12',
        title: '六堡茶与健康养生',
        type: '历史',
        coverImage: '/miniprogram/images/health.png',
        content: '六堡茶不仅口感独特，更具有多种保健功效。中医认为六堡茶性温，具有祛湿解暑、消食化滞、调理肠胃的作用...'
      }
    ]
  },

  onLoad(options) {
    this.loadTodayKnowledge();
    this.checkTodayKnowledgeCollectStatus();  // 检查收藏状态
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 0 });
    }
    // 每次显示时刷新收藏状态
    this.checkTodayKnowledgeCollectStatus();
  },

  loadTodayKnowledge() {
    const knowledgeList = [
      { content: '六堡茶因产于广西苍梧县六堡镇而得名，属于黑茶类。其独特的"槟榔香"是品质鉴别的关键指标，越陈越香。', source: '—— 六堡茶百科' },
      { content: '六堡茶制作技艺被列入国家级非物质文化遗产名录，包括杀青、揉捻、渥堆、复揉、干燥等传统工序。', source: '—— 非遗文化' },
      { content: '六堡茶有"红、浓、陈、醇"四绝之称，茶汤红浓明亮，滋味醇厚，陈香显著，耐于久藏。', source: '—— 茶经' },
      { content: '清代嘉庆年间，六堡茶以其独特的槟榔味被列为全国24种名茶之一，成为朝廷贡品。', source: '—— 历史记载' }
    ];
    const today = new Date().getDate();
    const index = today % knowledgeList.length;
    this.setData({ 
      todayKnowledge: {
        ...knowledgeList[index],
        isCollected: false  // 重置收藏状态
      }
    });
    this.checkTodayKnowledgeCollectStatus();
  },

  /**
   * 检查今日茶知识是否已收藏
   */
  checkTodayKnowledgeCollectStatus() {
    try {
      const favorites = wx.getStorageSync('favorites') || [];
      const isCollected = favorites.some(item => 
        item.type === 'knowledge' && item.content === this.data.todayKnowledge.content
      );
      this.setData({
        'todayKnowledge.isCollected': isCollected
      });
    } catch (e) {
      console.error('检查收藏状态失败', e);
    }
  },

  /**
   * 收藏/取消收藏今日茶知识
   */
  toggleCollectKnowledge() {
    const { todayKnowledge } = this.data;
    const isCollected = todayKnowledge.isCollected;
    
    if (isCollected) {
      // 取消收藏
      this.removeFromFavorites();
    } else {
      // 添加收藏
      this.addToFavorites();
    }
  },

  /**
   * 添加到收藏
   */
  addToFavorites() {
    try {
      let favorites = wx.getStorageSync('favorites') || [];
      const { todayKnowledge } = this.data;
      
      // 检查是否已存在
      const exists = favorites.some(item => 
        item.type === 'knowledge' && item.content === todayKnowledge.content
      );
      
      if (exists) {
        wx.showToast({ title: '已收藏过了', icon: 'none' });
        return;
      }
      
      // 添加新收藏
      const newFavorite = {
        id: Date.now(),
        type: 'knowledge',
        title: '今日茶知识',
        content: todayKnowledge.content,
        source: todayKnowledge.source,
        collectTime: this.formatTime(new Date())
      };
      
      favorites.unshift(newFavorite);
      wx.setStorageSync('favorites', favorites);
      
      this.setData({
        'todayKnowledge.isCollected': true
      });
      
      wx.showToast({ title: '收藏成功', icon: 'success' });
      wx.vibrateShort({ type: 'light' });  // 轻微震动反馈
      
    } catch (e) {
      console.error('收藏失败', e);
      wx.showToast({ title: '收藏失败', icon: 'error' });
    }
  },

  /**
   * 取消收藏
   */
  removeFromFavorites() {
    try {
      let favorites = wx.getStorageSync('favorites') || [];
      const { todayKnowledge } = this.data;
      
      favorites = favorites.filter(item => 
        !(item.type === 'knowledge' && item.content === todayKnowledge.content)
      );
      
      wx.setStorageSync('favorites', favorites);
      
      this.setData({
        'todayKnowledge.isCollected': false
      });
      
      wx.showToast({ title: '已取消收藏', icon: 'success' });
      
    } catch (e) {
      console.error('取消收藏失败', e);
      wx.showToast({ title: '操作失败', icon: 'error' });
    }
  },

  /**
   * 格式化时间
   */
  formatTime(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  },

  // 导航方法保持不变
  navigateToChat() { wx.switchTab({ url: '/miniprogram/pages/chat/chat' }); },
  navigateToMap() { wx.switchTab({ url: '/miniprogram/pages/map/map' }); },
  navigateToDiagnose() { wx.navigateTo({ url: '/miniprogram/pages/diagnose/diagnose' }); },
  navigateToGarden() { wx.navigateTo({ url: '/miniprogram/pages/garden/garden' }); },

  goToArticleDetail(e) {
    const id = e.currentTarget.dataset.id;
    console.log('跳转文章详情，ID:', id);
    wx.navigateTo({
      url: '/miniprogram/pages/detail/detail?id=' + id
    });
  },

  goToCulture() {
    wx.showToast({ title: '更多文章即将上线', icon: 'none' });
  },

  onShareAppMessage() {
    return { title: '六堡茶AI助手 - 千年古法，智能传承', path: '/pages/index/index' };
  }
});