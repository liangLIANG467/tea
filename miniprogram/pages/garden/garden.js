// miniprogram/pages/garden/garden.js
Page({
  data: {
    reportExpanded: false,
    healthScore: 92,
    harvestCount: 15,
    growthPercent: 78,
    inspectLoading: false,
    statusBarHeight: 0,
    navBarContentHeight: 75,  
    navBarTotalHeight: 0       
  },

  onLoad(options) {
    this.getSystemInfo();
    this.loadGardenData();
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 2 });
    }
  },

  // 获取系统信息，动态计算导航栏高度
  getSystemInfo() {
    try {
      const systemInfo = wx.getSystemInfoSync();
      // 状态栏高度（单位：px）
      const statusBarHeight = systemInfo.statusBarHeight || 20;
      // 导航栏内容高度（增加一倍，原来约44px，现在70px）
      const navBarContentHeight = 70;
      // 导航栏总高度 = 状态栏高度 + 导航栏内容高度
      const navBarTotalHeight = statusBarHeight + navBarContentHeight;
      
      this.setData({
        statusBarHeight: statusBarHeight,
        navBarContentHeight: navBarContentHeight,
        navBarTotalHeight: navBarTotalHeight
      });
      
      console.log('状态栏高度:', statusBarHeight, '导航栏总高度:', navBarTotalHeight);
    } catch (e) {
      console.error('获取系统信息失败', e);
      // 默认值
      this.setData({
        statusBarHeight: 20,
        navBarContentHeight: 70,
        navBarTotalHeight: 90
      });
    }
  },

  loadGardenData() {
    try {
      const gardenData = wx.getStorageSync('garden_data');
      if (gardenData) {
        this.setData({
          healthScore: gardenData.healthScore || 92,
          harvestCount: gardenData.harvestCount || 15,
          growthPercent: gardenData.growthPercent || 78
        });
      }
    } catch (e) {
      console.error('加载茶园数据失败', e);
    }
  },

  startInspect() {
    this.setData({ inspectLoading: true });
    
    wx.showLoading({
      title: 'AI分析中...',
      mask: true
    });

    setTimeout(() => {
      wx.hideLoading();
      this.setData({ inspectLoading: false });
      
      wx.showModal({
        title: 'AI巡检报告',
        content: '茶园整体状态良好，茶树生长健壮。叶片颜色正常，无病虫害迹象。土壤湿度适宜。建议：继续保持日常管理，7天后再次巡检。',
        confirmText: '知道了',
        showCancel: false
      });
    }, 2000);
  },

  expandReport() {
    this.setData({
      reportExpanded: !this.data.reportExpanded
    });
  },

  showMore() {
    wx.showActionSheet({
      itemList: ['编辑茶园信息', '种植记录', '浇水提醒设置'],
      success: (res) => {
        console.log('选择', res.tapIndex);
      }
    });
  },

  navigateBack() {
    wx.navigateBack();
  },

  onPullDownRefresh() {
    this.loadGardenData();
    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 1000);
  },

  onShareAppMessage() {
    return {
      title: '我的茶园 - 六堡茶AI助手',
      path: '/miniprogram/pages/garden/garden'
    };
  },

  goToQuiz() {
    wx.navigateTo({
      url: '/miniprogram/pages/quiz/quiz'
    });
  }
});