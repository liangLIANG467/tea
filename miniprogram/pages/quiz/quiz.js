// pages/quiz/quiz.js
const api = require('../../utils/api.js');

Page({
  data: {
    questions: [],
    currentIndex: 0,
    currentQuestion: null,
    selectedOption: '',
    options: [],
    isAnswered: false,
    isCorrect: false,
    explanation: '',
    score: 0,
    showResult: false,
    isLoading: true,
    totalQuestions: 0
  },

  onLoad(options) {
    this.loadQuestions();
  },

  loadQuestions() {
    this.setData({ isLoading: true });
    const BASE_URL = api.BASE_URL || 'http://127.0.0.1:5000';
    
    wx.request({
      url: `${BASE_URL}/api/questions/random?count=10`,
      method: 'GET',
      success: (res) => {
        if (res.data && res.data.success) {
          const questions = res.data.data;
          this.setData({
            questions: questions,
            currentQuestion: questions[0],
            options: questions[0].options,
            totalQuestions: questions.length,
            isLoading: false
          });
        } else {
          wx.showToast({ title: '加载失败', icon: 'error' });
          this.setData({ isLoading: false });
        }
      },
      fail: (err) => {
        console.error('加载题目失败', err);
        wx.showToast({ title: '网络错误', icon: 'error' });
        this.setData({ isLoading: false });
      }
    });
  },

  selectOption(e) {
    if (this.data.isAnswered) return;
    
    const option = e.currentTarget.dataset.option;
    this.setData({ selectedOption: option });
  },

  submitAnswer() {
    if (this.data.isAnswered) return;
    if (!this.data.selectedOption) {
      wx.showToast({ title: '请选择一个选项', icon: 'none' });
      return;
    }
    
    const { currentQuestion, selectedOption, score, currentIndex, questions } = this.data;
    const BASE_URL = api.BASE_URL || 'http://127.0.0.1:5000';
    
    wx.request({
      url: `${BASE_URL}/api/questions/check`,
      method: 'POST',
      data: {
        questionId: currentQuestion.id,
        answer: selectedOption
      },
      success: (res) => {
        if (res.data && res.data.success) {
          const isCorrect = res.data.isCorrect;
          const newScore = isCorrect ? score + 1 : score;
          
          this.setData({
            isAnswered: true,
            isCorrect: isCorrect,
            explanation: res.data.explanation,
            score: newScore
          });
        }
      },
      fail: (err) => {
        console.error('检查答案失败', err);
        // 本地验证降级
        const isCorrect = currentQuestion.answer === this.data.selectedOption;
        const newScore = isCorrect ? score + 1 : score;
        this.setData({
          isAnswered: true,
          isCorrect: isCorrect,
          explanation: currentQuestion.explanation || (isCorrect ? '回答正确！' : `正确答案是：${currentQuestion.answer}`),
          score: newScore
        });
      }
    });
  },

  nextQuestion() {
    const { currentIndex, questions, currentIndex: idx } = this.data;
    
    if (currentIndex + 1 >= questions.length) {
      // 答题结束，显示结果
      this.setData({ showResult: true });
      return;
    }
    
    const nextIndex = currentIndex + 1;
    this.setData({
      currentIndex: nextIndex,
      currentQuestion: questions[nextIndex],
      options: questions[nextIndex].options,
      selectedOption: '',
      isAnswered: false,
      isCorrect: false,
      explanation: ''
    });
  },

  restartQuiz() {
    this.setData({
      currentIndex: 0,
      score: 0,
      showResult: false,
      isAnswered: false,
      selectedOption: ''
    });
    this.loadQuestions();
  },

  goBack() {
    wx.navigateBack();
  }
});