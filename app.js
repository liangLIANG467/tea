// app.js
App({
  globalData: {
    userInfo: null,
    isLoggedIn: false,
    diagnoseCount: 0,
    chatCount: 0,
    gardenCount: 0
  },

  onLaunch: function() {
    // 初始化数据
    try {
      const userInfo = wx.getStorageSync('userInfo');
      if (userInfo) {
        this.globalData.userInfo = userInfo;
        this.globalData.isLoggedIn = true;
      }
    } catch (e) {
      console.error(e);
    }
  }
});